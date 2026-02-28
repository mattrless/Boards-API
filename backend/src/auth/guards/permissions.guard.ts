import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthUser } from '../types/auth-user.type';
import type { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
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

    if (!user?.systemRole?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // get permissions by rol of current user
    const role = await this.prisma.systemRole.findUnique({
      where: { id: user.systemRole.id },
      include: {
        systemRoleSystemPermissions: {
          include: {
            permission: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    const userPermissions = role.systemRoleSystemPermissions.map(
      (srp) => srp.permission.name,
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
