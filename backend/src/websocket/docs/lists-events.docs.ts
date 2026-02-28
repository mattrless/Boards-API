import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AsyncApi, AsyncApiSub } from 'nestjs-asyncapi';
import { Injectable } from '@nestjs/common';

class ListDataDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 'To Do' })
  title: string;

  @ApiProperty({ example: 1000 })
  position: number;
}

class ListMovedDataDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 1500 })
  position: number;

  @ApiPropertyOptional({ example: 9, nullable: true })
  prevListId: number | null;

  @ApiPropertyOptional({ example: 11, nullable: true })
  nextListId: number | null;
}

class ListCreatedUpdatedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 10 })
  listId: number;

  @ApiProperty({ type: () => ListDataDto })
  data: ListDataDto;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class ListMovedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 10 })
  listId: number;

  @ApiProperty({ type: () => ListMovedDataDto })
  data: ListMovedDataDto;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class ListDeletedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 10 })
  listId: number;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

@Injectable()
@AsyncApi()
export class ListsEventsAsyncApiContract {
  @AsyncApiSub({
    channel: 'list:created',
    message: { payload: ListCreatedUpdatedEventDto },
  })
  listCreated() {}

  @AsyncApiSub({
    channel: 'list:updated',
    message: { payload: ListCreatedUpdatedEventDto },
  })
  listUpdated() {}

  @AsyncApiSub({
    channel: 'list:moved',
    message: { payload: ListMovedEventDto },
  })
  listMoved() {}

  @AsyncApiSub({
    channel: 'list:deleted',
    message: { payload: ListDeletedEventDto },
  })
  listDeleted() {}
}
