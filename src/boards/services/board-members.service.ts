import { BoardsService } from './boards.service';
import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BoardMembersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
  ) {}

  async addMember(
    addMemberDto: AddMemberDto,
    boardId: number,
  ): Promise<ActionResponseDto> {
    try {
      const user = await this.usersService.getUserByEmail(addMemberDto.email);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const memberRoleId = await this.boardsService.getBoardRoleId('member');

      await this.prismaService.userBoard.create({
        data: {
          boardId: boardId,
          userId: user.id,
          boardRoleId: memberRoleId,
        },
      });

      return plainToInstance(
        ActionResponseDto,
        { message: 'Member added successfully' },
        {
          excludeExtraneousValues: true,
        },
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User is already a member of this board.');
      }

      throw new InternalServerErrorException('Failed to add member.');
    }
  }

  async removeMember(
    currentUserId: number,
    boardId: number,
    targetUserId: number,
  ): Promise<ActionResponseDto> {
    try {
      const board = await this.boardsService.getBoardById(boardId);
      const memberships = await this.prismaService.userBoard.findMany({
        where: {
          boardId,
          userId: {
            in: [currentUserId, targetUserId],
          },
        },
        include: {
          boardRole: {
            select: { name: true },
          },
        },
      });

      const currentMembership = memberships.find(
        (membership) => membership.userId === currentUserId,
      );
      const targetMembership = memberships.find(
        (membership) => membership.userId === targetUserId,
      );

      if (!currentMembership) {
        throw new ForbiddenException('Current user is not a board member.');
      }

      if (!targetMembership) {
        throw new NotFoundException('Member not found in this board.');
      }

      const currentUserIsOwner = board.ownerId === currentUserId;
      const targetUserIsOwner = board.ownerId === targetUserId;

      if (currentUserIsOwner && targetUserIsOwner) {
        throw new ConflictException(
          'Owner cannot remove himself from the board.',
        );
      }

      if (!currentUserIsOwner) {
        const currentRole = currentMembership.boardRole.name;
        const targetRole = targetMembership.boardRole.name;

        if (currentRole !== 'admin') {
          throw new ForbiddenException(
            'Only owner or admin can remove board members.',
          );
        }

        if (targetUserIsOwner) {
          throw new ConflictException('Admin cannot remove the board owner.');
        }

        if (targetRole === 'admin') {
          throw new ConflictException('Admin cannot remove another admin.');
        }

        if (targetRole !== 'member') {
          throw new ConflictException('Admin can only remove members.');
        }
      }

      await this.prismaService.userBoard.delete({
        where: {
          boardId_userId: {
            boardId,
            userId: targetUserId,
          },
        },
      });

      return plainToInstance(
        ActionResponseDto,
        { message: 'Member removed successfully' },
        {
          excludeExtraneousValues: true,
        },
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Member not found in this board.');
      }

      throw new InternalServerErrorException('Failed to remove member.');
    }
  }
}
