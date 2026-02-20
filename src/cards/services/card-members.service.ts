import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';
import { plainToInstance } from 'class-transformer';
import { Prisma } from 'generated/prisma/client';
import { CardMemberResponseDto } from '../dto/card-members-response.dto';
import { AddCardMemberDto } from '../dto/add-card-member.dto';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { CardsEventsService } from 'src/websocket/services/cards-events.service';

@Injectable()
export class CardMembersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cardsEventsService: CardsEventsService,
  ) {}

  async addMember(
    currentUser: AuthUser,
    boardId: number,
    cardId: number,
    addCardMemberDto: AddCardMemberDto,
  ) {
    try {
      const currentUserId = currentUser.id;
      const targetUserId = addCardMemberDto.userId;
      const currentUserIsSystemAdmin =
        currentUser.systemRole?.name?.toLowerCase().trim() === 'admin';

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
            select: {
              name: true,
            },
          },
        },
      });

      const currentMembership = memberships.find(
        (membership) => membership.userId === currentUserId,
      );
      const targetMembership = memberships.find(
        (membership) => membership.userId === targetUserId,
      );

      if (!currentMembership && !currentUserIsSystemAdmin) {
        throw new ForbiddenException('Current user is not a board member.');
      }

      if (!targetMembership) {
        throw new NotFoundException(
          'Target user is not a member of this board.',
        );
      }

      const currentRole =
        currentMembership?.boardRole.name.toLowerCase().trim() ?? '';
      const currentUserIsBoardAdmin = currentRole === 'admin';

      if (
        !currentUserIsSystemAdmin &&
        !currentUserIsBoardAdmin &&
        currentUserId !== targetUserId
      ) {
        throw new ForbiddenException(
          'Members can only add themselves to a card.',
        );
      }

      await this.prismaService.cardAssignment.create({
        data: {
          cardId,
          userId: targetUserId,
        },
      });

      this.cardsEventsService.emitCardMemberAdded(boardId, cardId, {
        boardId,
        cardId,
        targetUserId,
        actorId: currentUserId,
        timestamp: new Date().toISOString(),
      });

      return plainToInstance(
        ActionResponseDto,
        { message: 'Member added to card successfully' },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User is already assigned to this card.');
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Card or user not found.');
      }

      throw new InternalServerErrorException('Failed to add member to card.');
    }
  }

  async removeMember(
    currentUser: AuthUser,
    boardId: number,
    cardId: number,
    targetUserId: number,
  ) {
    try {
      const currentUserId = currentUser.id;
      const currentUserIsSystemAdmin =
        currentUser.systemRole?.name?.toLowerCase().trim() === 'admin';

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
            select: {
              name: true,
            },
          },
        },
      });

      const currentMembership = memberships.find(
        (membership) => membership.userId === currentUserId,
      );
      const targetMembership = memberships.find(
        (membership) => membership.userId === targetUserId,
      );

      if (!currentMembership && !currentUserIsSystemAdmin) {
        throw new ForbiddenException('Current user is not a board member.');
      }

      if (!targetMembership) {
        throw new NotFoundException(
          'Target user is not a member of this board.',
        );
      }

      const currentRole =
        currentMembership?.boardRole.name.toLowerCase().trim() ?? '';
      const currentUserIsBoardAdmin = currentRole === 'admin';

      if (
        !currentUserIsSystemAdmin &&
        !currentUserIsBoardAdmin &&
        currentUserId !== targetUserId
      ) {
        throw new ForbiddenException(
          'Members can only remove themselves from a card.',
        );
      }

      const deleted = await this.prismaService.cardAssignment.deleteMany({
        where: {
          cardId,
          userId: targetUserId,
        },
      });

      if (deleted.count === 0) {
        throw new NotFoundException('Member is not assigned to this card.');
      }

      this.cardsEventsService.emitCardMemberRemoved(boardId, cardId, {
        boardId,
        cardId,
        targetUserId,
        actorId: currentUserId,
        timestamp: new Date().toISOString(),
      });

      return plainToInstance(
        ActionResponseDto,
        { message: 'Member removed from card successfully' },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to remove member from card.',
      );
    }
  }

  async findCardMembers(boardId: number, cardId: number) {
    try {
      const assignments = await this.prismaService.cardAssignment.findMany({
        where: {
          cardId,
          user: {
            deletedAt: null,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true,
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
        },
      });

      const members = assignments.map((assignment) => ({
        user: {
          id: assignment.user.id,
          email: assignment.user.email,
          profile: assignment.user.profile,
        },
        assignedAt: assignment.createdAt,
      }));

      return plainToInstance(CardMemberResponseDto, members, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch card members.');
    }
  }
}
