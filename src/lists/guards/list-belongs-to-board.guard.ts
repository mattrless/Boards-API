import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ListBelongsToBoardGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const boardId = Number(request.params.boardId);
    const listId = Number(request.params.listId);

    if (!Number.isInteger(boardId)) {
      throw new BadRequestException('Invalid board id');
    }

    if (!Number.isInteger(listId)) {
      throw new BadRequestException('Invalid list id');
    }

    const list = await this.prismaService.list.findFirst({
      where: {
        id: listId,
        boardId,
      },
      select: { id: true },
    });

    if (!list) {
      throw new NotFoundException('List not found in this board');
    }

    return true;
  }
}
