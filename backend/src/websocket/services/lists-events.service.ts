import { Injectable } from '@nestjs/common';
import { BoardGateway } from '../gateways/board.gateway';

@Injectable()
export class ListsEventsService {
  constructor(private readonly boardGateway: BoardGateway) {}

  private emitToBoard(
    boardId: number,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.boardGateway.server.to(`board:${boardId}`).emit(event, payload);
  }

  emitListCreated(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'list:created', payload);
  }

  emitListUpdated(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'list:updated', payload);
  }

  emitListMoved(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'list:moved', payload);
  }

  emitListDeleted(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'list:deleted', payload);
  }
}
