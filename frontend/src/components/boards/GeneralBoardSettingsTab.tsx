"use client";

import { useState } from "react";

import BoardNameEditorForm from "@/components/boards/BoardNameEditorForm";
import type { BoardDetailsResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import { useUpdateBoardMutation } from "@/hooks/boards/use-update-board-mutation";
import { Card } from "../ui/card";
import DeleteBoardButton from "./DeleteBoardButton";

type GeneralBoardSettingsTabProps = {
  board: BoardDetailsResponseDto;
};

export default function GeneralBoardSettingsTab({
  board,
}: GeneralBoardSettingsTabProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateBoardMutation = useUpdateBoardMutation({
    onSuccess: () => {
      setSubmitError(null);
    },
    onErrorMessage: (message) => {
      setSubmitError(message);
    },
  });

  function handleRenameBoard(nextName: string) {
    setSubmitError(null);
    if (nextName === board.name) {
      return;
    }

    updateBoardMutation.mutate({
      boardId: board.id,
      data: { name: nextName },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Card className="px-3 py-3 sm:px-6">
        <BoardNameEditorForm
          initialName={board.name}
          isPending={updateBoardMutation.isPending}
          submitError={submitError}
          onSubmitName={handleRenameBoard}
          layout="inline"
          showCancel={false}
        />
      </Card>
      <Card className="px-3 py-3 sm:px-6">
        <DeleteBoardButton
          boardId={board.id}
          disabled={!board.isOwner}
          boardName={board.name}
        />
      </Card>
    </div>
  );
}
