import {
  BadRequestException,
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
import { List, Prisma } from 'generated/prisma/client';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';
import { UpdateListPositionDto } from './dto/update-list-position.dto';

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

  async updatePosition(
    boardId: number,
    listId: number,
    updateListPositionDto: UpdateListPositionDto,
  ) {
    const { prevListId, nextListId } = updateListPositionDto;

    if (prevListId === undefined && nextListId === undefined) {
      throw new BadRequestException(
        'prevListId or nextListId is required to move a list',
      );
    }

    if (prevListId === listId || nextListId === listId) {
      throw new BadRequestException(
        'Cannot position a list relative to itself',
      );
    }

    if (
      prevListId !== undefined &&
      nextListId !== undefined &&
      prevListId === nextListId
    ) {
      throw new BadRequestException(
        'prevListId and nextListId must be different',
      );
    }

    try {
      const list = await this.prismaService.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${boardId})`;

        let prevList: List | null = null;
        let nextList: List | null = null;

        if (prevListId !== undefined) {
          prevList = await tx.list.findFirst({
            where: {
              id: prevListId,
              boardId: boardId,
            },
          });
          if (!prevList) {
            throw new NotFoundException('prev list not found in this board');
          }
        }

        if (nextListId !== undefined) {
          nextList = await tx.list.findFirst({
            where: {
              id: nextListId,
              boardId: boardId,
            },
          });
          if (!nextList) {
            throw new NotFoundException('next list not found in this board');
          }
        }

        let newPosition: number;

        if (prevList && nextList) {
          if (prevList.position < nextList.position) {
            newPosition = (prevList.position + nextList.position) / 2;
          } else {
            throw new BadRequestException(
              'Invalid target order: prevList must be before nextList',
            );
          }
        } else if (prevList) {
          newPosition = prevList.position + 1000;
        } else if (nextList) {
          newPosition = nextList.position - 1000;
        } else {
          throw new BadRequestException(
            'prevListId or nextListId is required to move a list',
          );
        }

        return tx.list.update({
          where: { id: listId },
          data: { position: newPosition },
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

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Position conflict. Please retry the move operation.',
        );
      }

      throw new InternalServerErrorException('Failed to update list position');
    }
  }
}
