import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionType } from 'generated/prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthUser } from '../types/auth-user.type';
import type { Request } from 'express';

@Injectable()
export class BoardPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();

    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const boardId = Number(request.params.boardId);
    if (!Number.isInteger(boardId)) {
      throw new BadRequestException('Invalid board id');
    }

    const board = await this.prismaService.board.findFirst({
      where: { id: boardId, deletedAt: null },
      select: { id: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isSystemAdmin =
      user.systemRole?.name?.toLowerCase().trim() === 'admin';
    if (isSystemAdmin) {
      return true;
    }

    const membership = await this.prismaService.userBoard.findFirst({
      where: {
        boardId,
        userId: user.id,
        user: {
          deletedAt: null,
        },
      },
      include: {
        boardRole: {
          include: {
            boardRoleBoardPermissions: {
              where: {
                permission: {
                  type: PermissionType.BOARD,
                  name: { in: requiredPermissions },
                },
              },
              include: {
                permission: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a board member');
    }

    const userPermissions = membership.boardRole.boardRoleBoardPermissions.map(
      (brp) => brp.permission.name,
    );

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
