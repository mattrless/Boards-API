import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { CardBelongsToListGuard } from './guards/card-belongs-to-list.guard';

@Module({
  controllers: [CardsController],
  providers: [CardsService, CardBelongsToListGuard],
})
export class CardsModule {}
