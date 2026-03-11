import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CardSummaryResponseDto,
  ListSummaryResponseDto,
} from "@/lib/api/generated/boardsAPI.schemas";
import { useBoardsControllerFindMyBoardPermissions } from "@/lib/api/generated/boards/boards";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";
import {
  hasAllBoardPermissions,
  hasBoardPermission,
} from "@/lib/auth/board-permissions";
import EntityActions from "../common/EntityActions";
import { useState } from "react";
import { useRemoveListMutation } from "@/hooks/lists/use-remove-list-mutation";
import ListEditForm from "./ListEditForm";
import { useUpdateListMutation } from "@/hooks/lists/use-update-list-mutation";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@/lib/utils";
import { useCardsControllerFindAll } from "@/lib/api/generated/cards/cards";
import CardItem from "../cards/CardItem";
import CreateCardButton from "../cards/CreateCardButton";

export default function ListCard({
  list,
  index,
}: {
  list: ListSummaryResponseDto;
  index: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const boardId = useBoardIdParam();
  const userBoardInfoQuery = useBoardsControllerFindMyBoardPermissions(boardId);
  const removeListMutation = useRemoveListMutation(boardId);
  const updateListMutation = useUpdateListMutation({
    boardId,
    onSuccess: () => {
      setIsEditing(false);
      setEditError(null);
    },
    onErrorMessage: (message) => {
      setEditError(message);
    },
  });
  const userBoardInfo =
    userBoardInfoQuery.data?.status === 200
      ? userBoardInfoQuery.data.data
      : undefined;

  const userBoardPermissions = userBoardInfo?.permissions;

  const isMutating =
    removeListMutation.isPending || updateListMutation.isPending;

  const { ref, isDragging } = useSortable({
    id: list.id,
    index,
  });

  const { data, isPending } = useCardsControllerFindAll(boardId, list.id);

  if (isPending) return <div>Loading...</div>;
  if (data?.status !== 200) return <div>Error</div>;

  const cardItems: CardSummaryResponseDto[] = data?.data;

  function handleDelete() {
    removeListMutation.mutate({ boardId, listId: list.id });
  }

  function handleRenameList(nextTitle: string) {
    setEditError(null);
    if (nextTitle === list.title) {
      setIsEditing(false);
      return;
    }

    updateListMutation.mutate({
      boardId,
      listId: list.id,
      data: { title: nextTitle },
    });
  }

  function handleCancelEdit() {
    setEditError(null);
    setIsEditing(false);
  }

  function handleStartEdit() {
    setEditError(null);
    setIsEditing(true);
  }

  return (
    <div ref={ref}>
      <Card
        className={cn(
          "w-72 shrink-0 self-start overflow-hidden gap-0 pt-4 pb-2 max-h-[calc(100dvh-9rem)]",
          isDragging && "opacity-70",
        )}
      >
        <CardHeader className="px-4">
          {isEditing ? (
            <ListEditForm
              initialTitle={list.title}
              isPending={isMutating}
              submitError={editError}
              onCancel={handleCancelEdit}
              onSubmitName={handleRenameList}
            />
          ) : (
            <>
              <CardTitle className="line-clamp-1 leading-tight">
                {list.title}
              </CardTitle>
              <CardAction>
                {hasAllBoardPermissions(userBoardPermissions, [
                  "list_update",
                  "list_delete",
                ]) ? (
                  <EntityActions
                    entityLabel="List"
                    entityName={list.title}
                    disabled={isMutating}
                    onEdit={handleStartEdit}
                    onDelete={handleDelete}
                  />
                ) : null}
              </CardAction>
            </>
          )}
        </CardHeader>
        {cardItems.length ? (
          <CardContent className="scrollbar-hidden px-4 flex min-h-0 flex-col gap-2 overflow-y-auto">
            {cardItems.map((item) => (
              <CardItem key={item.id} item={item} />
            ))}
          </CardContent>
        ) : null}

        {hasBoardPermission(userBoardPermissions, "card_create") ? (
          <CardFooter className="pt-2 px-4">
            <CreateCardButton boardId={boardId} listId={list.id} />
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
