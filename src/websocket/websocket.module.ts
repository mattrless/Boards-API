import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BoardGateway } from './gateways/board.gateway';
import { BoardEventsService } from './services/boards-events.service';
import { ListsEventsService } from './services/lists-events.service';
import { CardsEventsService } from './services/cards-events.service';

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
  ],
  exports: [
    BoardGateway,
    BoardEventsService,
    ListsEventsService,
    CardsEventsService,
  ],
})
export class WebsocketModule {}
