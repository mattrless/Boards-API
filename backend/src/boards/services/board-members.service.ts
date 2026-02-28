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
import { UpdateBoardMemberRoleDto } from '../dto/update-board-member-role.dto';
import { BoardMemberResponseDto } from '../dto/board-members-response.dto';
import { BoardEventsService } from 'src/websocket/services/boards-events.service';

@Injectable()
export class BoardMembersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
    private readonly boardEventsService: BoardEventsService,
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

      this.boardEventsService.emitBoardMemberAdded(boardId, {
        boardId,
        targetUserId: user.id,
        role: 'member',
        timestamp: new Date().toISOString(),
      });
      this.boardEventsService.emitUserBoardsChanged(user.id, {
        boardId,
        reason: 'board:memberAdded',
        timestamp: new Date().toISOString(),
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
          user: {
            deletedAt: null,
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

      this.boardEventsService.emitBoardMemberRemoved(boardId, {
        boardId,
        actorId: currentUserId,
        targetUserId,
        timestamp: new Date().toISOString(),
      });
      this.boardEventsService.emitUserBoardsChanged(targetUserId, {
        boardId,
        reason: 'board:memberRemoved',
        timestamp: new Date().toISOString(),
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

  async updateBoardMemberRole(
    currentUserId: number,
    boardId: number,
    targetUserId: number,
    updateBoardMemberRoleDto: UpdateBoardMemberRoleDto,
  ): Promise<ActionResponseDto> {
    try {
      const board = await this.boardsService.getBoardById(boardId);
      const targetRoleId = await this.boardsService.getBoardRoleId(
        updateBoardMemberRoleDto.role,
      );
      const memberships = await this.prismaService.userBoard.findMany({
        where: {
          boardId,
          userId: {
            in: [currentUserId, targetUserId],
          },
          user: {
            deletedAt: null,
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
      const currentRole = currentMembership.boardRole.name;
      const targetRole = targetMembership.boardRole.name;
      const desiredRole = updateBoardMemberRoleDto.role;

      if (currentUserIsOwner && targetUserIsOwner) {
        throw new ConflictException(
          'Owner cannot update his own role through this endpoint.',
        );
      }

      if (targetUserIsOwner) {
        throw new ConflictException('Board owner role cannot be changed.');
      }

      if (targetRole === desiredRole) {
        throw new ConflictException('Member already has the requested role.');
      }

      if (!currentUserIsOwner) {
        if (currentRole !== 'admin') {
          throw new ForbiddenException(
            'Only owner or admin can update board member roles.',
          );
        }

        if (targetRole === 'admin') {
          throw new ConflictException(
            'Admin cannot change another admin role.',
          );
        }

        if (targetRole !== 'member' || desiredRole !== 'admin') {
          throw new ConflictException(
            'Admin can only promote members to admin.',
          );
        }
      }

      await this.prismaService.userBoard.update({
        where: {
          boardId_userId: {
            boardId,
            userId: targetUserId,
          },
        },
        data: {
          boardRoleId: targetRoleId,
        },
      });

      this.boardEventsService.emitBoardMemberRoleUpdated(boardId, {
        boardId,
        actorId: currentUserId,
        targetUserId,
        role: updateBoardMemberRoleDto.role,
        timestamp: new Date().toISOString(),
      });
      this.boardEventsService.emitUserBoardsChanged(targetUserId, {
        boardId,
        reason: 'board:memberRoleUpdated',
        timestamp: new Date().toISOString(),
      });

      return plainToInstance(
        ActionResponseDto,
        { message: 'Member role updated successfully' },
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

      throw new InternalServerErrorException('Failed to update member role.');
    }
  }

  async findBoardMembers(boardId: number) {
    try {
      const members = await this.prismaService.userBoard.findMany({
        where: {
          boardId: boardId,
          user: {
            deletedAt: null,
          },
        },
        select: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          boardRole: {
            select: {
              name: true,
            },
          },
          board: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      const membersWithOwner = members.map((member) => ({
        user: member.user,
        boardRole: member.boardRole,
        isOwner: member.user.id === member.board.ownerId,
      }));

      return plainToInstance(BoardMemberResponseDto, membersWithOwner, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch board members.');
    }
  }
}
