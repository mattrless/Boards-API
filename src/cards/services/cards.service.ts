import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { UpdateCardPositionDto } from '../dto/update-card-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CardResponseDto } from '../dto/card-response.dto';
import { CardSummaryResponseDto } from '../dto/card-summary-response.dto';
import { Card, Prisma } from 'generated/prisma/client';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(boardId: number, listId: number, createCardDto: CreateCardDto) {
    try {
      const card = await this.prismaService.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${boardId})`;

        const lastCard = await tx.card.findFirst({
          where: { listId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });

        const newPosition = (lastCard?.position ?? 0) + 1000;

        return tx.card.create({
          data: {
            title: createCardDto.title,
            description: createCardDto.description,
            position: newPosition,
            list: {
              connect: {
                id: listId,
              },
            },
          },
          include: {
            list: {
              select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });
      });

      return plainToInstance(CardResponseDto, card, {
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
        throw new NotFoundException('List not found');
      }

      throw new InternalServerErrorException('Failed to create card.');
    }
  }

  async findAll(listId: number) {
    try {
      const cards = await this.prismaService.card.findMany({
        where: {
          listId: listId,
        },
        orderBy: {
          position: 'asc',
        },
      });

      return plainToInstance(CardSummaryResponseDto, cards, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch cards.');
    }
  }

  async findOne(listId: number, cardId: number) {
    try {
      const card = await this.prismaService.card.findUnique({
        where: {
          id: cardId,
          listId: listId,
        },
        include: {
          list: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!card) {
        throw new NotFoundException('Card not found');
      }

      return plainToInstance(CardResponseDto, card, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch card.');
    }
  }

  async update(listId: number, cardId: number, updateCardDto: UpdateCardDto) {
    try {
      const data: Prisma.CardUpdateInput = {
        title: updateCardDto.title,
        description:
          updateCardDto.description !== undefined
            ? updateCardDto.description
            : undefined,
      };

      const card = await this.prismaService.card.update({
        where: { id: cardId, listId: listId },
        data,
        include: {
          list: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return plainToInstance(CardResponseDto, card, {
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
        throw new NotFoundException('Card not found');
      }

      throw new InternalServerErrorException('Failed to update card');
    }
  }

  async updatePosition(
    boardId: number,
    cardId: number,
    updateCardPositionDto: UpdateCardPositionDto,
  ) {
    const { targetListId, prevCardId, nextCardId } = updateCardPositionDto;

    if (prevCardId === cardId || nextCardId === cardId) {
      throw new BadRequestException(
        'Cannot position a card relative to itself',
      );
    }

    if (
      prevCardId !== undefined &&
      nextCardId !== undefined &&
      prevCardId === nextCardId
    ) {
      throw new BadRequestException(
        'prevCardId and nextCardId must be different',
      );
    }

    try {
      const card = await this.prismaService.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${boardId})`;

        const movingCard = await tx.card.findFirst({
          where: {
            id: cardId,
            list: {
              boardId,
            },
          },
          select: {
            id: true,
            listId: true,
          },
        });

        if (!movingCard) {
          throw new NotFoundException('Card not found in this board');
        }

        const destinationListId = targetListId ?? movingCard.listId;

        const destinationList = await tx.list.findFirst({
          where: {
            id: destinationListId,
            boardId,
          },
          select: {
            id: true,
          },
        });

        if (!destinationList) {
          throw new NotFoundException('Target list not found in this board');
        }

        const destinationCardsCount = await tx.card.count({
          where: {
            listId: destinationListId,
            id: {
              not: movingCard.id,
            },
          },
        });

        let prevCard: Card | null = null;
        let nextCard: Card | null = null;

        if (prevCardId !== undefined) {
          prevCard = await tx.card.findFirst({
            where: {
              id: prevCardId,
              listId: destinationListId,
            },
          });
          if (!prevCard) {
            throw new NotFoundException('prev card not found in target list');
          }
        }

        if (nextCardId !== undefined) {
          nextCard = await tx.card.findFirst({
            where: {
              id: nextCardId,
              listId: destinationListId,
            },
          });
          if (!nextCard) {
            throw new NotFoundException('next card not found in target list');
          }
        }

        if (prevCard && !nextCard) {
          const lastCard = await tx.card.findFirst({
            where: {
              listId: destinationListId,
            },
            orderBy: {
              position: 'desc',
            },
            select: {
              id: true,
            },
          });

          if (!lastCard || lastCard.id !== prevCard.id) {
            throw new BadRequestException(
              'To move a card to the middle, provide both prevCardId and nextCardId',
            );
          }
        }

        if (nextCard && !prevCard) {
          const firstCard = await tx.card.findFirst({
            where: {
              listId: destinationListId,
            },
            orderBy: {
              position: 'asc',
            },
            select: {
              id: true,
            },
          });

          if (!firstCard || firstCard.id !== nextCard.id) {
            throw new BadRequestException(
              'To move a card to the middle, provide both prevCardId and nextCardId',
            );
          }
        }

        let newPosition: number;

        if (!prevCard && !nextCard) {
          if (destinationCardsCount === 0) {
            newPosition = 1000;
          } else {
            throw new BadRequestException(
              'prevCardId or nextCardId is required to move a card',
            );
          }
        } else if (prevCard && nextCard) {
          if (prevCard.position < nextCard.position) {
            const cardsBetween = await tx.card.count({
              where: {
                listId: destinationListId,
                id: {
                  not: movingCard.id,
                },
                position: {
                  gt: prevCard.position,
                  lt: nextCard.position,
                },
              },
            });

            if (cardsBetween > 0) {
              throw new BadRequestException(
                'prevCardId and nextCardId must be adjacent cards',
              );
            }

            newPosition = (prevCard.position + nextCard.position) / 2;
          } else {
            throw new BadRequestException(
              'Invalid target order: prevCard must be before nextCard',
            );
          }
        } else if (prevCard) {
          newPosition = prevCard.position + 1000;
        } else if (nextCard) {
          newPosition = nextCard.position - 1000;
        } else {
          throw new BadRequestException(
            'Invalid position payload. Provide prevCardId, nextCardId, or both.',
          );
        }

        return tx.card.update({
          where: {
            id: movingCard.id,
          },
          data: {
            listId: destinationListId,
            position: newPosition,
          },
          include: {
            list: {
              select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });
      });

      return plainToInstance(CardResponseDto, card, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Position conflict. Please retry the move operation.',
        );
      }

      throw new InternalServerErrorException('Failed to update card position');
    }
  }

  async remove(listId: number, cardId: number) {
    try {
      const deleted = await this.prismaService.card.deleteMany({
        where: {
          id: cardId,
          listId,
        },
      });

      if (deleted.count === 0) {
        throw new NotFoundException('Card not found');
      }

      return plainToInstance(
        ActionResponseDto,
        { message: 'Card deleted successfully' },
        {
          excludeExtraneousValues: true,
        },
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete card');
    }
  }
}
