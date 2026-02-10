import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Request } from 'express';
import { AuthUser } from 'src/auth/types/auth-user.type';

@Injectable()
export class EnsureBoardOwnershipGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser | undefined;

    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const boardId = Number(request.params.id);
    if (!Number.isInteger(boardId)) {
      throw new BadRequestException('Invalid board id');
    }

    const board = await this.prismaService.board.findFirst({
      where: { id: boardId },
      select: { ownerId: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== user.id) {
      throw new ForbiddenException(`Forbidden: Insufficient permissions.`);
    }

    return true;
  }
}
