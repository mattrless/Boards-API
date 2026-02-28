import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AsyncApi, AsyncApiSub } from 'nestjs-asyncapi';
import { Injectable } from '@nestjs/common';

class CardDataDto {
  @ApiProperty({ example: 55 })
  id: number;

  @ApiProperty({ example: 'Implement realtime updates' })
  title: string;

  @ApiProperty({ example: 'Add socket events for list/card updates' })
  description: string;

  @ApiProperty({ example: 1000 })
  position: number;
}

class CardMovedDataDto {
  @ApiProperty({ example: 55 })
  id: number;

  @ApiProperty({ example: 1500 })
  position: number;

  @ApiProperty({ example: 11 })
  targetListId: number;

  @ApiPropertyOptional({ example: 54, nullable: true })
  prevCardId: number | null;

  @ApiPropertyOptional({ example: 56, nullable: true })
  nextCardId: number | null;
}

class CardCreatedUpdatedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 10 })
  listId: number;

  @ApiProperty({ example: 55 })
  cardId: number;

  @ApiProperty({ type: () => CardDataDto })
  data: CardDataDto;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class CardMovedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 11 })
  listId: number;

  @ApiProperty({ example: 55 })
  cardId: number;

  @ApiProperty({ type: () => CardMovedDataDto })
  data: CardMovedDataDto;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class CardDeletedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 10 })
  listId: number;

  @ApiProperty({ example: 55 })
  cardId: number;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class CardMemberChangedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 55 })
  cardId: number;

  @ApiProperty({ example: 7 })
  targetUserId: number;

  @ApiProperty({ example: 3 })
  actorId: number;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

@Injectable()
@AsyncApi()
export class CardsEventsAsyncApiContract {
  @AsyncApiSub({
    channel: 'card:created',
    message: { payload: CardCreatedUpdatedEventDto },
  })
  cardCreated() {}

  @AsyncApiSub({
    channel: 'card:updated',
    message: { payload: CardCreatedUpdatedEventDto },
  })
  cardUpdated() {}

  @AsyncApiSub({
    channel: 'card:moved',
    message: { payload: CardMovedEventDto },
  })
  cardMoved() {}

  @AsyncApiSub({
    channel: 'card:deleted',
    message: { payload: CardDeletedEventDto },
  })
  cardDeleted() {}

  @AsyncApiSub({
    channel: 'card:memberAdded',
    message: { payload: CardMemberChangedEventDto },
  })
  cardMemberAdded() {}

  @AsyncApiSub({
    channel: 'card:memberRemoved',
    message: { payload: CardMemberChangedEventDto },
  })
  cardMemberRemoved() {}
}
