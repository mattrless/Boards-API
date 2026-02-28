import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BoardGateway } from './gateways/board.gateway';
import { BoardEventsService } from './services/boards-events.service';
import { ListsEventsService } from './services/lists-events.service';
import { CardsEventsService } from './services/cards-events.service';
import { ClientEventsAsyncApiContract } from './docs/client-events.docs';
import { BoardsEventsAsyncApiContract } from './docs/boards-events.docs';
import { ListsEventsAsyncApiContract } from './docs/lists-events.docs';
import { CardsEventsAsyncApiContract } from './docs/cards-events.docs';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  providers: [
    BoardGateway,
    BoardEventsService,
    ListsEventsService,
    CardsEventsService,
    ClientEventsAsyncApiContract,
    BoardsEventsAsyncApiContract,
    ListsEventsAsyncApiContract,
    CardsEventsAsyncApiContract,
  ],
  exports: [
    BoardGateway,
    BoardEventsService,
    ListsEventsService,
    CardsEventsService,
  ],
})
export class WebsocketModule {}
