import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { ActionResponseDto } from './dto/action-response.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private config: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);

      const defaultSystemRoleId = await this.getDefaultSystemRoleId();

      const user = await this.prismaService.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          systemRole: {
            connect: { id: defaultSystemRoleId },
          },
          profile: {
            create: {
              name: createUserDto.profile.name,
              avatar: createUserDto.profile.avatar,
            },
          },
        },
        include: { profile: true, systemRole: true },
      });

      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll() {
    try {
      const users = await this.prismaService.user.findMany({
        include: { profile: true, systemRole: true },
      });

      return plainToInstance(UserResponseDto, users, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
      include: {
        profile: true,
        systemRole: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateSelf(userId: number, updateUserDto: UpdateUserDto) {
    await this.ensureUserExists(userId);

    const data: Prisma.UserUpdateInput = {
      email: updateUserDto.email,
      password: updateUserDto.password
        ? await this.hashPassword(updateUserDto.password)
        : undefined,
      profile: updateUserDto.profile
        ? {
            update: {
              name: updateUserDto.profile.name,
              avatar: updateUserDto.profile.avatar,
            },
          }
        : undefined,
    };

    try {
      const user = await this.prismaService.user.update({
        where: { id: userId },
        data,
        include: { profile: true, systemRole: true },
      });

      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async adminUpdate(userId: number, adminUpdateUserDto: AdminUpdateUserDto) {
    await this.ensureUserExists(userId);

    const data: Prisma.UserUpdateInput = {
      email: adminUpdateUserDto.email,
      password: adminUpdateUserDto.password
        ? await this.hashPassword(adminUpdateUserDto.password)
        : undefined,
      profile: adminUpdateUserDto.profile
        ? {
            update: {
              name: adminUpdateUserDto.profile.name,
              avatar: adminUpdateUserDto.profile.avatar,
            },
          }
        : undefined,
      systemRole: adminUpdateUserDto.systemRoleId
        ? { connect: { id: adminUpdateUserDto.systemRoleId } }
        : undefined,
    };

    try {
      const user = await this.prismaService.user.update({
        where: { id: userId },
        data,
        include: { profile: true, systemRole: true },
      });

      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException('User not found');
          case 'P2002':
            throw new ConflictException('Email already in use');
        }
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number) {
    await this.ensureUserExists(id);
    await this.prismaService.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return plainToInstance(
      ActionResponseDto,
      { message: 'User deleted successfully' },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async restore(id: number) {
    const result = await this.prismaService.user.updateMany({
      where: {
        id,
        deletedAt: { not: null },
      },
      data: { deletedAt: null },
    });

    if (result.count === 0) {
      throw new NotFoundException('User not found or not deleted');
    }

    return plainToInstance(
      ActionResponseDto,
      { message: 'User restored successfully' },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async getDefaultSystemRoleId() {
    const systemRole = await this.prismaService.systemRole.findFirst({
      where: {
        name: 'user',
      },
    });

    if (!systemRole) {
      throw new InternalServerErrorException(
        `Default system role is not configured in database`,
      );
    }

    return systemRole.id;
  }

  private async ensureUserExists(id: number) {
    const exists = await this.prismaService.user.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }

  private async hashPassword(password: string) {
    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS')) || 10;
    const hashedPassword = await bcrypt.hash(password, rounds);
    return hashedPassword;
  }
}
