"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import { getBoardMembersControllerFindBoardMembersQueryKey } from "@/lib/api/generated/board-members/board-members";
import {
  getBoardsControllerFindMyBoardPermissionsQueryKey,
  getBoardsControllerFindOneQueryKey,
} from "@/lib/api/generated/boards/boards";
import { createAuthenticatedSocket } from "@/lib/utils/socket";

export function useBoardMembersChangedSocket(boardId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    let socket: Socket;
    let cancelled = false;

    const refresh = () => {
      queryClient.invalidateQueries({
        queryKey: getBoardMembersControllerFindBoardMembersQueryKey(boardId),
      });
      queryClient.invalidateQueries({
        queryKey: getBoardsControllerFindOneQueryKey(boardId),
      });
      queryClient.invalidateQueries({
        queryKey: getBoardsControllerFindMyBoardPermissionsQueryKey(boardId),
      });
    };

    createAuthenticatedSocket(apiUrl).then((s) => {
      if (!s || cancelled) {
        s?.disconnect();
        return;
      }
      socket = s;

      socket.on("connect", () => {
        socket.emit("board:join", { boardId });
      });

      socket.on("board:memberAdded", refresh);
      socket.on("board:memberRemoved", refresh);
      socket.on("board:memberRoleUpdated", refresh);
      socket.on("board:ownershipTransferred", refresh);
      socket.on("board:updated", refresh);
    });

    return () => {
      cancelled = true;
      socket?.off("connect");
      socket?.off("board:memberAdded", refresh);
      socket?.off("board:memberRemoved", refresh);
      socket?.off("board:memberRoleUpdated", refresh);
      socket?.off("board:ownershipTransferred", refresh);
      socket?.off("board:updated", refresh);
      if (socket?.connected) socket.emit("board:leave", { boardId });
      socket?.disconnect();
    };
  }, [boardId, queryClient]);
}
