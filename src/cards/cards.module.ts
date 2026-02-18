import { Module } from '@nestjs/common';
import { CardsService } from './services/cards.service';
import { CardBelongsToListGuard } from './guards/card-belongs-to-list.guard';
import { CardsPositionController } from './controllers/cards-position.controller';
import { CardBelongsToBoardGuard } from './guards/card-belongs-to-board.guard';
import { CardsController } from './controllers/cards.controller';

@Module({
  controllers: [CardsController, CardsPositionController],
  providers: [CardsService, CardBelongsToListGuard, CardBelongsToBoardGuard],
})
export class CardsModule {}
