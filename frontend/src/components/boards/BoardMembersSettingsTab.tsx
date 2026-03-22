"use client";

import { useState } from "react";

import type {
  BoardDetailsResponseDto,
  BoardMemberResponseDto,
} from "@/lib/api/generated/boardsAPI.schemas";
import { Card } from "../ui/card";
import AddBoardMemberForm from "./AddBoardMemberForm";
import { useAddBoardMemberMutation } from "@/hooks/boards/use-add-board-member-mutation";
import { useBoardMembersControllerFindBoardMembers } from "@/lib/api/generated/board-members/board-members";
import BoardMembersDataTable from "./BoardMembersDataTable";
import { useMeQuery } from "@/hooks/auth/use-me-query";

type BoardMembersSettingsTabProps = {
  board: BoardDetailsResponseDto;
};

export default function BoardMembersSettingsTab({
  board,
}: BoardMembersSettingsTabProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const addBoardMemberMutation = useAddBoardMemberMutation({
    boardId: board.id,
    onSuccess: () => {
      setSubmitError(null);
      setResetSignal((value) => value + 1);
    },
    onErrorMessage: (message) => {
      setSubmitError(message);
    },
  });

  function handleAddBoardMember(email: string) {
    setSubmitError(null);

    addBoardMemberMutation.mutate({
      boardId: board.id,
      data: {
        email,
      },
    });
  }

  const currentUserId = useMeQuery().data?.id;

  const membersQueryData = useBoardMembersControllerFindBoardMembers(board.id)
    .data?.data;

  const boardMembers: BoardMemberResponseDto[] = Array.isArray(membersQueryData)
    ? membersQueryData
    : [];

  return (
    <div className="flex flex-col gap-2">
      <Card className="px-3 py-3 sm:px-6">
        <AddBoardMemberForm
          isPending={addBoardMemberMutation.isPending}
          submitError={submitError}
          onSubmitEmail={handleAddBoardMember}
          resetSignal={resetSignal}
        />
      </Card>
      <Card className="px-3 py-3 sm:px-6">
        <BoardMembersDataTable
          boardId={board.id}
          members={boardMembers}
          currentUserId={currentUserId ?? 0}
        />
      </Card>
    </div>
  );
}
