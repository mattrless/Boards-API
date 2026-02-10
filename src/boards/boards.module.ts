import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardExistsPipe } from './pipes/board-exists.pipe';
import { EnsureBoardOwnershipGuard } from './guards/ensure-board-ownership.guard';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, BoardExistsPipe, EnsureBoardOwnershipGuard],
})
export class BoardsModule {}
