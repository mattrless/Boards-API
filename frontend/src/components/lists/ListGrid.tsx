"use client";

import { DragDropProvider } from "@dnd-kit/react";
import ListCard from "./ListCard";
import {
  CardSummaryResponseDto,
  ListSummaryResponseDto,
} from "@/lib/api/generated/boardsAPI.schemas";
import CreateListCard from "./CreateListCard";
import { useBoardsControllerFindMyBoardPermissions } from "@/lib/api/generated/boards/boards";
import { hasBoardPermission } from "@/lib/auth/board-permissions";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";
import { useUpdateListPositionMutation } from "@/hooks/lists/use-update-position-mutation";
import { useUpdateCardPositionMutation } from "@/hooks/cards/use-update-position-mutation";
import { getCardsControllerFindAllQueryKey } from "@/lib/api/generated/cards/cards";
import { useQueryClient } from "@tanstack/react-query";
import onDragEnd from "@/lib/utils/onDragEnd";
import { toast } from "sonner";

export default function ListGrid({
  lists,
}: {
  lists: ListSummaryResponseDto[];
}) {
  const boardId = useBoardIdParam();
  const userBoardInfoQuery = useBoardsControllerFindMyBoardPermissions(boardId);
  const userBoardInfo =
    userBoardInfoQuery.data?.status === 200
      ? userBoardInfoQuery.data.data
      : undefined;

  const userBoardPermissions = userBoardInfo?.permissions;
  const queryClient = useQueryClient();

  const updateListPositionMutation = useUpdateListPositionMutation({
    boardId,
  });
  const updateCardPositionMutation = useUpdateCardPositionMutation({
    boardId,
  });

  function getCardsInList(listId: number) {
    const queryKey = getCardsControllerFindAllQueryKey(boardId, listId);
    const cached = queryClient.getQueryData<{
      status: number;
      data: CardSummaryResponseDto[];
    }>(queryKey);
    return cached?.status === 200 ? cached.data : [];
  }

  return (
    <DragDropProvider
      onBeforeDragStart={(event) => {
        const sourceType = event.operation.source?.type;

        if (
          sourceType === "list" &&
          !hasBoardPermission(userBoardPermissions, "list_update")
        ) {
          event.preventDefault();
          toast.info("Members can't move lists");
        }

        if (
          sourceType === "card" &&
          !hasBoardPermission(userBoardPermissions, "card_update")
        ) {
          event.preventDefault();
        }
      }}
      onDragEnd={(event) => {
        onDragEnd({
          event,
          lists,
          boardId,
          updateListPositionMutation,
          updateCardPositionMutation,
          getCardsInList,
        });
      }}
    >
      <div className="w-full overflow-x-auto">
        <div className="flex w-max items-start gap-4">
          {lists.map((list, index) => (
            <ListCard list={list} index={index} key={list.id} />
          ))}

          {hasBoardPermission(userBoardPermissions, "list_create") ? (
            <CreateListCard />
          ) : null}
        </div>
      </div>
    </DragDropProvider>
  );
}
