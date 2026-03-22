"use client";

import { Button } from "@/components/ui/button";
import {
  getBoardMembersControllerFindBoardMembersQueryKey,
  useBoardMembersControllerUpdateBoardMemberRole,
} from "@/lib/api/generated/board-members/board-members";
import { getBoardsControllerFindOneQueryKey } from "@/lib/api/generated/boards/boards";
import { BoardMemberActionButtonProps } from "@/lib/types/board-member-action-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ChangeRoleButton({
  boardId,
  member,
  disabled,
}: BoardMemberActionButtonProps) {
  const targetRole = member.boardRole.name === "admin" ? "member" : "admin";
  const queryClient = useQueryClient();
  const changeRoleQuery = useBoardMembersControllerUpdateBoardMemberRole({
    mutation: {
      onSuccess: (res) => {
        if (res.status === 200) {
          toast.success("Role updated");
          queryClient.invalidateQueries({
            queryKey: getBoardsControllerFindOneQueryKey(boardId),
          });
          queryClient.invalidateQueries({
            queryKey:
              getBoardMembersControllerFindBoardMembersQueryKey(boardId),
          });
          return;
        }
        if (res.status === 409) {
          toast.info("Can't degrade another admin");
        }
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    },
  });

  const handleClick = () => {
    const targetUserId = member.user.id;
    changeRoleQuery.mutate({
      boardId,
      targetUserId,
      data: {
        role: targetRole,
      },
    });
  };
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled}
      onClick={handleClick}
      aria-label={`Change role for ${member.user.profile?.name ?? member.user.email}`}
    >
      Make {targetRole}
    </Button>
  );
}
