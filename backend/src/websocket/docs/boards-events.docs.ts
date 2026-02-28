import { ApiProperty } from '@nestjs/swagger';
import { AsyncApi, AsyncApiSub } from 'nestjs-asyncapi';
import { Injectable } from '@nestjs/common';

class BoardSnapshotDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Project board' })
  name: string;

  @ApiProperty({ example: '2026-02-20T18:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-02-20T18:00:00.000Z' })
  updatedAt: string;
}

class BoardUpdatedDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Project board renamed' })
  name: string;

  @ApiProperty({ example: 3 })
  ownerId: number;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  updatedAt: string;
}

class BoardsChangedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 'board:updated' })
  reason: string;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class BoardCreatedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 3 })
  actorId: number;

  @ApiProperty({ type: () => BoardSnapshotDto })
  data: BoardSnapshotDto;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class BoardUpdatedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 1 })
  entityId: number;

  @ApiProperty({ type: () => BoardUpdatedDataDto })
  data: BoardUpdatedDataDto;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class BoardDeletedRestoredEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 1 })
  entityId: number;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class BoardOwnershipTransferredEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 1 })
  entityId: number;

  @ApiProperty({ example: 3 })
  previousOwnerId: number;

  @ApiProperty({ example: 7 })
  newOwnerId: number;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class BoardMemberAddedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 7 })
  targetUserId: number;

  @ApiProperty({ example: 'member' })
  role: string;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class BoardMemberRemovedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 3 })
  actorId: number;

  @ApiProperty({ example: 7 })
  targetUserId: number;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

class BoardMemberRoleUpdatedEventDto {
  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiProperty({ example: 3 })
  actorId: number;

  @ApiProperty({ example: 7 })
  targetUserId: number;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: '2026-02-20T18:10:00.000Z' })
  timestamp: string;
}

@Injectable()
@AsyncApi()
export class BoardsEventsAsyncApiContract {
  @AsyncApiSub({
    channel: 'boards:changed',
    message: { payload: BoardsChangedEventDto },
  })
  boardsChanged() {}

  @AsyncApiSub({
    channel: 'board:created',
    message: { payload: BoardCreatedEventDto },
  })
  boardCreated() {}

  @AsyncApiSub({
    channel: 'board:updated',
    message: { payload: BoardUpdatedEventDto },
  })
  boardUpdated() {}

  @AsyncApiSub({
    channel: 'board:deleted',
    message: { payload: BoardDeletedRestoredEventDto },
  })
  boardDeleted() {}

  @AsyncApiSub({
    channel: 'board:restored',
    message: { payload: BoardDeletedRestoredEventDto },
  })
  boardRestored() {}

  @AsyncApiSub({
    channel: 'board:ownershipTransferred',
    message: { payload: BoardOwnershipTransferredEventDto },
  })
  boardOwnershipTransferred() {}

  @AsyncApiSub({
    channel: 'board:memberAdded',
    message: { payload: BoardMemberAddedEventDto },
  })
  boardMemberAdded() {}

  @AsyncApiSub({
    channel: 'board:memberRemoved',
    message: { payload: BoardMemberRemovedEventDto },
  })
  boardMemberRemoved() {}

  @AsyncApiSub({
    channel: 'board:memberRoleUpdated',
    message: { payload: BoardMemberRoleUpdatedEventDto },
  })
  boardMemberRoleUpdated() {}
}
