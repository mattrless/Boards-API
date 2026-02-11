import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { UserExistsPipe } from './pipes/user-exists.pipe';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, UserExistsPipe, PermissionsGuard],
  exports: [UsersService, UserExistsPipe],
})
export class UsersModule {}
