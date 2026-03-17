"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import { getCardMembersControllerFindCardMembersQueryKey } from "@/lib/api/generated/card-members/card-members";
import { createAuthenticatedSocket } from "@/lib/utils/socket";

export function useCardMembersSocket(boardId: number, cardId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    let socket: Socket;
    let cancelled = false;

    const refresh = () => {
      queryClient.invalidateQueries({
        queryKey: getCardMembersControllerFindCardMembersQueryKey(
          boardId,
          cardId,
        ),
      });
    };

    createAuthenticatedSocket(apiUrl).then((s) => {
      if (!s || cancelled) {
        s?.disconnect();
        return;
      }
      socket = s;

      socket.on("connect", () => {
        socket.emit("card:join", { cardId });
      });

      socket.on("card:memberAdded", refresh);
      socket.on("card:memberRemoved", refresh);
    });

    return () => {
      cancelled = true;
      socket?.off("connect");
      socket?.off("card:memberAdded", refresh);
      socket?.off("card:memberRemoved", refresh);
      if (socket?.connected) socket.emit("card:leave", { cardId });
      socket?.disconnect();
    };
  }, [boardId, cardId, queryClient]);
}
