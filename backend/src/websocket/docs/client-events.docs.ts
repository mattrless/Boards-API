import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AsyncApi, AsyncApiPub } from 'nestjs-asyncapi';
import { Injectable } from '@nestjs/common';

class BoardJoinMessageDto {
  @ApiProperty({ example: 1 })
  boardId: number;
}

class CardJoinMessageDto {
  @ApiProperty({ example: 10 })
  cardId: number;
}

class UserJoinMessageDto {}

class UserLeaveMessageDto {
  @ApiPropertyOptional({ example: 3 })
  userId?: number;
}

@Injectable()
@AsyncApi()
export class ClientEventsAsyncApiContract {
  @AsyncApiPub({
    channel: 'board:join',
    summary: 'Join board room',
    message: { payload: BoardJoinMessageDto },
  })
  boardJoin() {}

  @AsyncApiPub({
    channel: 'board:leave',
    summary: 'Leave board room',
    message: { payload: BoardJoinMessageDto },
  })
  boardLeave() {}

  @AsyncApiPub({
    channel: 'card:join',
    summary: 'Join card room',
    message: { payload: CardJoinMessageDto },
  })
  cardJoin() {}

  @AsyncApiPub({
    channel: 'card:leave',
    summary: 'Leave card room',
    message: { payload: CardJoinMessageDto },
  })
  cardLeave() {}

  @AsyncApiPub({
    channel: 'user:join',
    summary: 'Confirm authenticated user room',
    message: { payload: UserJoinMessageDto },
  })
  userJoin() {}

  @AsyncApiPub({
    channel: 'user:leave',
    summary: 'Leave authenticated user room',
    message: { payload: UserLeaveMessageDto },
  })
  userLeave() {}
}
