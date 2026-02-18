import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CardResponseDto } from './dto/card-response.dto';
import { CardSummaryResponseDto } from './dto/card-summary-response.dto';
import { Prisma } from 'generated/prisma/client';
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
