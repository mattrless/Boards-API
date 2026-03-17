"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import { getCardsControllerFindAllQueryKey } from "@/lib/api/generated/cards/cards";
import {
  CardCreatedUpdatedEvent,
  CardDeletedEvent,
  CardMovedEvent,
} from "@/lib/types/card-events";
import { createAuthenticatedSocket } from "@/lib/utils/socket";

export function useCardsChangedSocket(boardId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    let socket: Socket;
    let cancelled = false;

    const handleCardMoved = async (payload: CardMovedEvent) => {
      const targetListId = payload.listId;
      const sourceListId = payload.sourceListId;
      await queryClient.invalidateQueries({
        queryKey: getCardsControllerFindAllQueryKey(boardId, targetListId),
      });
      if (targetListId !== sourceListId) {
        await queryClient.invalidateQueries({
          queryKey: getCardsControllerFindAllQueryKey(boardId, sourceListId),
        });
      }
    };

    const handleCardCreated = async (payload: CardCreatedUpdatedEvent) => {
      await queryClient.invalidateQueries({
        queryKey: getCardsControllerFindAllQueryKey(boardId, payload.listId),
      });
    };

    const handleCardUpdated = async (payload: CardCreatedUpdatedEvent) => {
      await queryClient.invalidateQueries({
        queryKey: getCardsControllerFindAllQueryKey(boardId, payload.listId),
      });
    };

    const handleCardDeleted = async (payload: CardDeletedEvent) => {
      await queryClient.invalidateQueries({
        queryKey: getCardsControllerFindAllQueryKey(boardId, payload.listId),
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

      socket.on("card:moved", handleCardMoved);
      socket.on("card:created", handleCardCreated);
      socket.on("card:updated", handleCardUpdated);
      socket.on("card:deleted", handleCardDeleted);
    });

    return () => {
      cancelled = true;
      socket?.off("connect");
      socket?.off("card:moved", handleCardMoved);
      socket?.off("card:created", handleCardCreated);
      socket?.off("card:updated", handleCardUpdated);
      socket?.off("card:deleted", handleCardDeleted);
      if (socket?.connected) socket.emit("board:leave", { boardId });
      socket?.disconnect();
    };
  }, [boardId, queryClient]);
}
