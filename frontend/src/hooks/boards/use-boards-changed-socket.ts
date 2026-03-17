"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import {
  getBoardsControllerFindMyBoardPermissionsQueryKey,
  getBoardsControllerFindMyBoardsQueryKey,
} from "@/lib/api/generated/boards/boards";
import { BoardChangedEvent } from "@/lib/types/board-events";
import { createAuthenticatedSocket } from "@/lib/utils/socket";

type UseBoardsChangedSocketOptions = {
  currentBoardId?: number;
  onBoardDeleted?: (payload: BoardChangedEvent) => void;
};

export function useBoardsChangedSocket(
  options?: UseBoardsChangedSocketOptions,
) {
  const queryClient = useQueryClient();
  const currentBoardId = options?.currentBoardId;
  const onBoardDeleted = options?.onBoardDeleted;

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    let socket: Socket;
    let cancelled = false;

    const invalidateBoards = async (payload: BoardChangedEvent) => {
      queryClient.invalidateQueries({
        queryKey: getBoardsControllerFindMyBoardsQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getBoardsControllerFindMyBoardPermissionsQueryKey(
          payload.boardId,
        ),
      });
      if (
        payload.reason === "board:deleted" &&
        currentBoardId !== undefined &&
        payload.boardId === currentBoardId
      ) {
        onBoardDeleted?.(payload);
      }
    };

    createAuthenticatedSocket(apiUrl).then((s) => {
      if (!s || cancelled) {
        s?.disconnect();
        return;
      }
      socket = s;

      socket.on("connect", () => {
        socket.emit("user:join");
      });

      socket.on("boards:changed", invalidateBoards);
    });

    return () => {
      cancelled = true;
      socket?.off("connect");
      socket?.off("boards:changed", invalidateBoards);
      socket?.disconnect();
    };
  }, [queryClient, currentBoardId, onBoardDeleted]);
}
