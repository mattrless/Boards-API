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
import { Prisma } from 'generated/prisma/client';

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

  findAll() {
    return `This action returns all cards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
