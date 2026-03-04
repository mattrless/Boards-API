"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { MyBoardResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import {
  getBoardsControllerFindMyBoardsQueryKey,
  useBoardsControllerRemove,
  useBoardsControllerUpdate,
} from "@/lib/api/generated/boards/boards";
import { getErrorMessageByStatus } from "@/lib/errors/api-error";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BoardNameEditorForm from "@/components/boards/BoardNameEditorForm";
import BoardQuickActions from "@/components/boards/BoardQuickActions";

type BoardCardProps = {
  board: MyBoardResponseDto;
};

export default function BoardCard({ board }: BoardCardProps) {
  const queryClient = useQueryClient();
  const removeBoardMutation = useBoardsControllerRemove();
  const updateBoardMutation = useBoardsControllerUpdate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const updatedDate = new Date(board.updatedAt).toLocaleString();
  const isMutating =
    removeBoardMutation.isPending || updateBoardMutation.isPending;

  async function refreshBoards() {
    await queryClient.invalidateQueries({
      queryKey: getBoardsControllerFindMyBoardsQueryKey(),
    });
  }

  async function handleDeleteBoard() {
    try {
      const res = await removeBoardMutation.mutateAsync({ boardId: board.id });

      if (res.status === 200) {
        toast.success("Board deleted.");
        await refreshBoards();
        return;
      }

      toast.error(
        getErrorMessageByStatus(res.status, {
          403: "You do not have permission to delete this board.",
          404: "Board not found.",
        }),
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleRenameBoard(nextName: string) {
    setEditError(null);
    if (nextName === board.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const res = await updateBoardMutation.mutateAsync({
        boardId: board.id,
        data: { name: nextName },
      });

      if (res.status === 200) {
        toast.success("Board renamed.");
        setIsEditingName(false);
        setEditError(null);
        await refreshBoards();
        return;
      }

      setEditError(
        getErrorMessageByStatus(res.status, {
          400: "Invalid board name.",
          403: "You do not have permission to update this board.",
          404: "Board not found.",
        }),
      );
    } catch {
      setEditError("Something went wrong. Please try again.");
    }
  }

  function handleCancelEdit() {
    setEditError(null);
    setIsEditingName(false);
  }

  function handleStartEdit() {
    setEditError(null);
    setIsEditingName(true);
  }

  return (
    <Card className="h-full">
      {isEditingName ? (
        <CardContent className="space-y-3 p-6">
          <BoardNameEditorForm
            initialName={board.name}
            isPending={isMutating}
            submitError={editError}
            onCancel={handleCancelEdit}
            onSubmitName={handleRenameBoard}
          />
        </CardContent>
      ) : (
        <>
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="line-clamp-1 text-lg">
                {board.name}
              </CardTitle>
              <div className="flex items-center gap-1">
                {board.isOwner ? (
                  <BoardQuickActions
                    boardName={board.name}
                    disabled={isMutating}
                    onEditName={handleStartEdit}
                    onDeleteBoard={handleDeleteBoard}
                  />
                ) : null}

                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {board.isOwner ? "Owned" : "Shared"}
                </span>
              </div>
            </div>
            <CardDescription>Updated {updatedDate}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto space-y-3 pt-0">
            <div className="flex items-center justify-end">
              <Button type="button" size="sm">
                Open
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
