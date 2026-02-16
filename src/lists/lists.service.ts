import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ListResponseDto } from './dto/list-response.dto';
import { ListSummaryResponseDto } from './dto/list-summary-response.dto';
import { Prisma } from 'generated/prisma/client';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';

@Injectable()
export class ListsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(boardId: number, createListDto: CreateListDto) {
    try {
      const list = await this.prismaService.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${boardId})`;

        const lastList = await tx.list.findFirst({
          where: { boardId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });

        const newPosition = (lastList?.position ?? 0) + 1000;

        return tx.list.create({
          data: {
            title: createListDto.title,
            position: newPosition,
            board: {
              connect: {
                id: boardId,
              },
            },
          },
          include: {
            board: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });
      });

      return plainToInstance(ListResponseDto, list, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Board not found');
      }

      throw new InternalServerErrorException('Failed to create list.');
    }
  }

  async findAll(boardId: number) {
    try {
      const lists = await this.prismaService.list.findMany({
        where: {
          boardId: boardId,
        },
        orderBy: {
          position: 'asc',
        },
      });

      return plainToInstance(ListSummaryResponseDto, lists, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch lists.');
    }
  }

  async findOne(id: number) {
    try {
      const list = await this.prismaService.list.findUnique({
        where: {
          id,
        },
        include: {
          board: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!list) {
        throw new NotFoundException('List not found');
      }

      return plainToInstance(ListResponseDto, list, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch list.');
    }
  }

  async update(listId: number, updateListDto: UpdateListDto) {
    try {
      const data: Prisma.ListUpdateInput = {
        title: updateListDto.title,
      };

      const list = await this.prismaService.list.update({
        where: { id: listId },
        data,
        include: {
          board: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return plainToInstance(ListResponseDto, list, {
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
        throw new NotFoundException('List not found');
      }

      throw new InternalServerErrorException('Failed to update list');
    }
  }

  async remove(listId: number) {
    try {
      await this.prismaService.list.delete({
        where: {
          id: listId,
        },
      });

      return plainToInstance(
        ActionResponseDto,
        { message: 'List deleted successfully' },
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
        throw new NotFoundException('List not found');
      }

      throw new InternalServerErrorException('Failed to delete list');
    }
  }
}
