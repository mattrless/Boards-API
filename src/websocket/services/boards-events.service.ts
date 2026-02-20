import { Injectable, Logger } from '@nestjs/common';
import { BoardGateway } from '../gateways/board.gateway';

@Injectable()
export class BoardEventsService {
  private readonly logger = new Logger(BoardEventsService.name);

  constructor(private readonly boardGateway: BoardGateway) {}

  private emitToBoard(
    boardId: number,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.boardGateway.server.to(`board:${boardId}`).emit(event, payload);
  }

  private emitToUser(
    userId: number,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.logger.log(
      `Emitting ${event} to user:${userId} payload=${JSON.stringify(payload)}`,
    );
    this.boardGateway.server.to(`user:${userId}`).emit(event, payload);
  }

  emitBoardCreated(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'board:created', payload);
  }

  emitBoardUpdated(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'board:updated', payload);
  }

  emitBoardDeleted(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'board:deleted', payload);
  }

  emitBoardRestored(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'board:restored', payload);
  }

  emitBoardOwnershipTransferred(
    boardId: number,
    payload: Record<string, unknown>,
  ) {
    this.emitToBoard(boardId, 'board:ownershipTransferred', payload);
  }

  emitBoardMemberAdded(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'board:memberAdded', payload);
  }

  emitBoardMemberRemoved(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'board:memberRemoved', payload);
  }

  emitBoardMemberRoleUpdated(
    boardId: number,
    payload: Record<string, unknown>,
  ) {
    this.emitToBoard(boardId, 'board:memberRoleUpdated', payload);
  }

  emitUserBoardsChanged(userId: number, payload: Record<string, unknown>) {
    this.emitToUser(userId, 'boards:changed', payload);
  }
}
