"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  getBoardsControllerFindMyBoardPermissionsQueryKey,
  getBoardsControllerFindMyBoardsQueryKey,
} from "@/lib/api/generated/boards/boards";
import { BoardChangedEvent } from "@/lib/types/board-events";

export function useBoardsChangedSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const socket = io(apiUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("user:join");
    });

    const invalidateBoards = async (payload: BoardChangedEvent) => {
      queryClient.invalidateQueries({
        queryKey: getBoardsControllerFindMyBoardsQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getBoardsControllerFindMyBoardPermissionsQueryKey(
          payload.boardId,
        ),
      });
    };

    socket.on("boards:changed", invalidateBoards);

    return () => {
      socket.off("connect");
      socket.off("boards:changed", invalidateBoards);
      socket.disconnect();
    };
  }, [queryClient]);
}
