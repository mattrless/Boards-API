import { Module } from '@nestjs/common';
import { CardsService } from './services/cards.service';
import { CardBelongsToListGuard } from './guards/card-belongs-to-list.guard';
import { CardsPositionController } from './controllers/cards-position.controller';
import { CardBelongsToBoardGuard } from './guards/card-belongs-to-board.guard';
import { CardsController } from './controllers/cards.controller';
import { CardMembersController } from './controllers/card-members.controller';
import { CardMembersService } from './services/card-members.service';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [
    CardsController,
    CardsPositionController,
    CardMembersController,
  ],
  providers: [
    CardsService,
    CardMembersService,
    CardBelongsToListGuard,
    CardBelongsToBoardGuard,
  ],
})
export class CardsModule {}
