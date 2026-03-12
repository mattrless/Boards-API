export type BoardChangedReason =
  | "board:created"
  | "board:updated"
  | "board:deleted"
  | "board:restored"
  | "board:ownershipTransferred"
  | "board:memberAdded"
  | "board:memberRemoved"
  | "board:memberRoleUpdated";

export type BoardChangedEvent = {
  boardId: number;
  reason: BoardChangedReason;
  timestamp: string;
};
