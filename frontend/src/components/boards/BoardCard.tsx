"use client";

import { useState } from "react";

import type { MyBoardResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BoardNameEditorForm from "@/components/boards/BoardNameEditorForm";
import Link from "next/link";
import { cn } from "@/lib/utils";
import EntityActions from "../common/EntityActions";
import { useRemoveBoardMutation } from "@/hooks/boards/use-remove-board-mutation";
import { useUpdateBoardMutation } from "@/hooks/boards/use-update-board-mutation";

type BoardCardProps = {
  board: MyBoardResponseDto;
};

export default function BoardCard({ board }: BoardCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const removeBoardMutation = useRemoveBoardMutation();
  const updateBoardMutation = useUpdateBoardMutation({
    onSuccess: () => {
      setIsEditingName(false);
      setEditError(null);
    },
    onErrorMessage: (message) => {
      setEditError(message);
    },
  });
  const updatedDate = new Date(board.updatedAt).toLocaleString();
  const isMutating =
    removeBoardMutation.isPending || updateBoardMutation.isPending;

  function handleDeleteBoard() {
    removeBoardMutation.mutate({ boardId: board.id });
  }

  function handleRenameBoard(nextName: string) {
    setEditError(null);
    if (nextName === board.name) {
      setIsEditingName(false);
      return;
    }

    updateBoardMutation.mutate({
      boardId: board.id,
      data: { name: nextName },
    });
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
    <Card className={cn("h-full", isEditingName && "py-0")}>
      {isEditingName ? (
        <CardContent className="flex min-h-40 items-center justify-center py-4">
          <div className="flex w-full max-w-sm flex-col gap-3">
            <BoardNameEditorForm
              initialName={board.name}
              isPending={isMutating}
              submitError={editError}
              onCancel={handleCancelEdit}
              onSubmitName={handleRenameBoard}
            />
          </div>
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
                  <EntityActions
                    entityLabel="Board"
                    entityName={board.name}
                    disabled={isMutating}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteBoard}
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
              <Button size="sm" asChild>
                <Link href={"/boards/" + board.id}>Open</Link>
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
