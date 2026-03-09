import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListSummaryResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import { useBoardsControllerFindMyBoardPermissions } from "@/lib/api/generated/boards/boards";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";
import { hasAllBoardPermissions } from "@/lib/auth/board-permissions";
import EntityActions from "../common/EntityActions";
import { useState } from "react";
import { useRemoveListMutation } from "@/hooks/lists/use-remove-list-mutation";
import ListEditForm from "./ListEditForm";
import { useUpdateListMutation } from "@/hooks/lists/use-update-list-mutation";

export default function ListCard({ list }: { list: ListSummaryResponseDto }) {
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
    <Card className="min-w-72">
      <CardHeader>
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
            <CardTitle className="line-clamp-1">{list.title}</CardTitle>
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
    </Card>
  );
}
