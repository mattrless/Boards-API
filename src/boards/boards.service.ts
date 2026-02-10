import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardResponseDto } from './dto/board-response.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { BoardOwnerResponseDto } from './dto/board-owner-response.dto';
import { ActionResponseDto } from 'src/users/dto/action-response.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(ownerId: number, createBoardDto: CreateBoardDto) {
    try {
      const adminBoardRoleId = await this.getBoardRoleId('admin');

      const board = await this.prismaService.client.$transaction(async (tx) => {
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

      return plainToInstance(BoardResponseDto, board, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
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
      const boards = await this.prismaService.board.findMany();

      return plainToInstance(BoardResponseDto, boards, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch boards');
    }
  }

  async findOne(id: number) {
    const board = await this.prismaService.board.findFirst({
      where: { id },
      include: {
        owner: true,
      },
    });

    return plainToInstance(BoardOwnerResponseDto, board, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    try {
      const data: Prisma.BoardUpdateInput = {
        name: updateBoardDto.name,
        owner:
          updateBoardDto.ownerId !== undefined
            ? {
                connect: {
                  id: updateBoardDto.ownerId,
                },
              }
            : undefined,
      };

      const board = await this.prismaService.board.update({
        where: { id: id },
        data,
        include: {
          owner: true,
        },
      });

      return plainToInstance(BoardOwnerResponseDto, board, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Owner not found');
      }
      console.log(error);
      throw new InternalServerErrorException('Failed to update board');
    }
  }

  async remove(id: number) {
    await this.prismaService.board.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return plainToInstance(
      ActionResponseDto,
      { message: 'Board deleted successfully' },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async restore(id: number) {
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

    return plainToInstance(
      ActionResponseDto,
      { message: 'Board restored successfully' },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async getBoardRoleId(name: string) {
    const boardRole = await this.prismaService.boardRole.findFirst({
      where: { name: name },
      select: { id: true },
    });

    if (!boardRole) {
      throw new InternalServerErrorException(
        'Admin board role is not configured in database',
      );
    }

    return boardRole.id;
  }
}
