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
export class CardBelongsToBoardGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const boardId = Number(request.params.boardId);
    const cardId = Number(request.params.cardId);

    if (!Number.isInteger(boardId)) {
      throw new BadRequestException('Invalid board id');
    }

    if (!Number.isInteger(cardId)) {
      throw new BadRequestException('Invalid card id');
    }

    const card = await this.prismaService.card.findFirst({
      where: {
        id: cardId,
        list: {
          boardId,
        },
      },
      select: { id: true },
    });

    if (!card) {
      throw new NotFoundException('Card not found in this board');
    }

    return true;
  }
}
