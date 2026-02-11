import { Module } from '@nestjs/common';
import { BoardsController } from './controllers/boards.controller';
import { BoardExistsPipe } from './pipes/board-exists.pipe';
import { EnsureBoardOwnershipGuard } from './guards/ensure-board-ownership.guard';
import { BoardMembersController } from './controllers/board-members.controller';
import { BoardsService } from './services/boards.service';
import { BoardMembersService } from './services/board-members.service';
import { UsersModule } from 'src/users/users.module';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';

@Module({
  imports: [UsersModule],
  controllers: [BoardsController, BoardMembersController],
  providers: [
    BoardsService,
    BoardExistsPipe,
    EnsureBoardOwnershipGuard,
    BoardMembersService,
    PermissionsGuard,
    BoardPermissionsGuard,
  ],
})
export class BoardsModule {}
