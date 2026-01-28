import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private config: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS')) || 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, rounds);

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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private async getDefaultSystemRoleId() {
    const systemRole = await this.prismaService.systemRole.findUnique({
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
}
