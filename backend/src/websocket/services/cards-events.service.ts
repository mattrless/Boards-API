import { Injectable } from '@nestjs/common';
import { BoardGateway } from '../gateways/board.gateway';

@Injectable()
export class CardsEventsService {
  constructor(private readonly boardGateway: BoardGateway) {}

  private emitToBoard(
    boardId: number,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.boardGateway.server.to(`board:${boardId}`).emit(event, payload);
  }

  private emitToCard(
    cardId: number,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.boardGateway.server.to(`card:${cardId}`).emit(event, payload);
  }

  emitCardCreated(boardId: number, payload: Record<string, unknown>) {
    this.emitToBoard(boardId, 'card:created', payload);
  }

  emitCardUpdated(
    boardId: number,
    cardId: number,
    payload: Record<string, unknown>,
  ) {
    this.emitToBoard(boardId, 'card:updated', payload);
    this.emitToCard(cardId, 'card:updated', payload);
  }

  emitCardMoved(
    boardId: number,
    cardId: number,
    payload: Record<string, unknown>,
  ) {
    this.emitToBoard(boardId, 'card:moved', payload);
    this.emitToCard(cardId, 'card:moved', payload);
  }

  emitCardDeleted(
    boardId: number,
    cardId: number,
    payload: Record<string, unknown>,
  ) {
    this.emitToBoard(boardId, 'card:deleted', payload);
    this.emitToCard(cardId, 'card:deleted', payload);
  }

  emitCardMemberAdded(
    boardId: number,
    cardId: number,
    payload: Record<string, unknown>,
  ) {
    this.emitToBoard(boardId, 'card:memberAdded', payload);
    this.emitToCard(cardId, 'card:memberAdded', payload);
  }

  emitCardMemberRemoved(
    boardId: number,
    cardId: number,
    payload: Record<string, unknown>,
  ) {
    this.emitToBoard(boardId, 'card:memberRemoved', payload);
    this.emitToCard(cardId, 'card:memberRemoved', payload);
  }
}
