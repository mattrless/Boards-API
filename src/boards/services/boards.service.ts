import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';
import { CreateBoardDto } from '../dto/create-board.dto';
import { BoardResponseDto } from '../dto/board-response.dto';
import { Prisma } from 'generated/prisma/client';
import { BoardOwnerResponseDto } from '../dto/board-owner-response.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { BoardDetailsResponseDto } from '../dto/board-details-response.dto';
import { BoardEventsService } from 'src/websocket/services/boards-events.service';
import { MyBoardResponseDto } from '../dto/my-board-response.dto';

@Injectable()
export class BoardsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly boardEventsService: BoardEventsService,
  ) {}

  async create(ownerId: number, createBoardDto: CreateBoardDto) {
    try {
      const adminBoardRoleId = await this.getBoardRoleId('admin');

      const board = await this.prismaService.$transaction(async (tx) => {
        const createdBoard = await tx.board.create({
          data: {
            name: createBoardDto.name,
            owner: {
              connect: {
                id: ownerId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        await tx.userBoard.create({
          data: {
            boardId: createdBoard.id,
            userId: ownerId,
            boardRoleId: adminBoardRoleId,
          },
        });

        return createdBoard;
      });

      this.boardEventsService.emitBoardCreated(board.id, {
        boardId: board.id,
        actorId: ownerId,
        data: board,
        timestamp: new Date().toISOString(),
      });
      this.boardEventsService.emitUserBoardsChanged(ownerId, {
        boardId: board.id,
        reason: 'board:created',
        timestamp: new Date().toISOString(),
      });

      return plainToInstance(BoardResponseDto, board, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Owner not found');
      }
      throw new InternalServerErrorException('Failed to create board');
    }
  }

  async findAll() {
    try {
      const boards = await this.prismaService.board.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          owner: true,
        },
      });

      return plainToInstance(BoardOwnerResponseDto, boards, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch boards');
    }
  }

  async findMyBoards(userId: number) {
    try {
      const boards = await this.prismaService.board.findMany({
        where: {
          deletedAt: null,
          userBoards: {
            some: {
              userId,
              user: {
                deletedAt: null,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        },
      });

      const payload = boards.map((board) => ({
        id: board.id,
        name: board.name,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        isOwner: board.ownerId === userId,
      }));

      return plainToInstance(MyBoardResponseDto, payload, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch user boards');
    }
  }

  async findOne(id: number) {
    const board = await this.prismaService.board.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        owner: true,
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                cardAssignments: {
                  where: {
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
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const boardWithDetails = {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) => ({
          ...card,
          members: card.cardAssignments.map((assignment) => ({
            user: {
              id: assignment.user.id,
              email: assignment.user.email,
              profile: assignment.user.profile,
            },
            assignedAt: assignment.createdAt,
          })),
        })),
      })),
    };

    return plainToInstance(BoardDetailsResponseDto, boardWithDetails, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    try {
      await this.getBoardById(id);
      const memberIds = await this.prismaService.userBoard.findMany({
        where: {
          boardId: id,
          user: {
            deletedAt: null,
          },
        },
        select: {
          userId: true,
        },
      });

      const data: Prisma.BoardUpdateInput = {
        name: updateBoardDto.name,
      };

      const board = await this.prismaService.board.update({
        where: { id: id },
        data,
        include: {
          owner: true,
        },
      });

      this.boardEventsService.emitBoardUpdated(board.id, {
        boardId: board.id,
        entityId: board.id,
        data: {
          id: board.id,
          name: board.name,
          ownerId: board.ownerId,
          updatedAt: board.updatedAt,
        },
        timestamp: new Date().toISOString(),
      });
      for (const member of memberIds) {
        this.boardEventsService.emitUserBoardsChanged(member.userId, {
          boardId: board.id,
          reason: 'board:updated',
          timestamp: new Date().toISOString(),
        });
      }

      return plainToInstance(BoardOwnerResponseDto, board, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Board not found');
      }
      throw new InternalServerErrorException('Failed to update board');
    }
  }

  async remove(id: number) {
    const memberIds = await this.prismaService.userBoard.findMany({
      where: {
        boardId: id,
        user: {
          deletedAt: null,
        },
      },
      select: {
        userId: true,
      },
    });

    const result = await this.prismaService.board.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundException('Board not found');
    }

    this.boardEventsService.emitBoardDeleted(id, {
      boardId: id,
      entityId: id,
      timestamp: new Date().toISOString(),
    });
    for (const member of memberIds) {
      this.boardEventsService.emitUserBoardsChanged(member.userId, {
        boardId: id,
        reason: 'board:deleted',
        timestamp: new Date().toISOString(),
      });
    }

    return plainToInstance(
      ActionResponseDto,
      { message: 'Board deleted successfully' },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async restore(id: number) {
    const memberIds = await this.prismaService.userBoard.findMany({
      where: {
        boardId: id,
        user: {
          deletedAt: null,
        },
      },
      select: {
        userId: true,
      },
    });

    const result = await this.prismaService.board.updateMany({
      where: {
        id,
        deletedAt: { not: null },
      },
      data: { deletedAt: null },
    });

    if (result.count === 0) {
      throw new NotFoundException('Board not found or not deleted');
    }

    this.boardEventsService.emitBoardRestored(id, {
      boardId: id,
      entityId: id,
      timestamp: new Date().toISOString(),
    });
    for (const member of memberIds) {
      this.boardEventsService.emitUserBoardsChanged(member.userId, {
        boardId: id,
        reason: 'board:restored',
        timestamp: new Date().toISOString(),
      });
    }

    return plainToInstance(
      ActionResponseDto,
      { message: 'Board restored successfully' },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async transferOwnership(boardId: number, targetUserId: number) {
    try {
      const board = await this.getBoardById(boardId);

      if (board.ownerId === targetUserId) {
        throw new ConflictException('Target user is already the owner');
      }

      await this.prismaService.$transaction(async (tx) => {
        const boardAdminRole = await tx.boardRole.findFirst({
          where: { name: 'admin' },
          select: { id: true },
        });

        if (!boardAdminRole) {
          throw new InternalServerErrorException(
            'Board role is not configured in database',
          );
        }

        const targetUserBoardRole = await tx.userBoard.findFirst({
          where: {
            boardId,
            userId: targetUserId,
            user: {
              deletedAt: null,
            },
          },
          select: {
            boardRole: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!targetUserBoardRole) {
          throw new NotFoundException(
            'Target user not found or is not in board.',
          );
        }

        const targetUserBoardRoleName = targetUserBoardRole.boardRole.name;

        if (targetUserBoardRoleName === 'member') {
          await tx.userBoard.update({
            where: {
              boardId_userId: {
                boardId,
                userId: targetUserId,
              },
            },
            data: {
              boardRoleId: boardAdminRole.id,
            },
          });
        } else if (targetUserBoardRoleName !== 'admin') {
          throw new ConflictException(
            `Cannot transfer ownership to board role "${targetUserBoardRoleName}".`,
          );
        }

        await tx.board.update({
          where: {
            id: boardId,
          },
          data: {
            owner: {
              connect: {
                id: targetUserId,
              },
            },
          },
        });
      });

      this.boardEventsService.emitBoardOwnershipTransferred(boardId, {
        boardId,
        entityId: boardId,
        previousOwnerId: board.ownerId,
        newOwnerId: targetUserId,
        timestamp: new Date().toISOString(),
      });
      this.boardEventsService.emitUserBoardsChanged(board.ownerId, {
        boardId,
        reason: 'board:ownershipTransferred',
        timestamp: new Date().toISOString(),
      });
      this.boardEventsService.emitUserBoardsChanged(targetUserId, {
        boardId,
        reason: 'board:ownershipTransferred',
        timestamp: new Date().toISOString(),
      });

      return plainToInstance(
        ActionResponseDto,
        { message: 'Board ownership transferred' },
        {
          excludeExtraneousValues: true,
        },
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to transfer board ownership.',
      );
    }
  }

  async getBoardRoleId(name: string) {
    const boardRole = await this.prismaService.boardRole.findFirst({
      where: { name: name },
      select: { id: true },
    });

    if (!boardRole) {
      throw new InternalServerErrorException(
        'Board role is not configured in database',
      );
    }

    return boardRole.id;
  }

  async getBoardById(id: number) {
    const board = await this.prismaService.board.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        owner: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }
}
