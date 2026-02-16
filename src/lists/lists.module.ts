import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { ListBelongsToBoardGuard } from './guards/list-belongs-to-board.guard';

@Module({
  controllers: [ListsController],
  providers: [ListsService, ListBelongsToBoardGuard],
})
export class ListsModule {}
