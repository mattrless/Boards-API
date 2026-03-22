"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CardSummaryResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import CardInformationForm from "./CardInformationForm";
import CardMembersDataTable from "./CardMembersDataTable";
import { useBoardsControllerFindMyBoardPermissions } from "@/lib/api/generated/boards/boards";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";
import { useCardMembersSocket } from "@/hooks/cards/use-card-members-socket";
import { hasBoardPermission } from "@/lib/auth/board-permissions";
import DeleteCardButton from "./DeleteCardButton";

type CardItemDialogProps = {
  card: CardSummaryResponseDto;
  listId: number;
  children: ReactNode;
};

export default function CardItemDialog({
  card,
  listId,
  children,
}: CardItemDialogProps) {
  const boardId = useBoardIdParam();

  const userBoardInfoQuery = useBoardsControllerFindMyBoardPermissions(boardId);
  const userBoardInfo =
    userBoardInfoQuery.data?.status === 200
      ? userBoardInfoQuery.data.data
      : undefined;

  const userBoardRole = userBoardInfo?.boardRole;
  const userBoardPermissions = userBoardInfo?.permissions;
  const canRemoveMembers = userBoardRole !== "member";

  const [isOpen, setIsOpen] = useState(false);

  useCardMembersSocket(boardId, card.id, isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-3 sm:max-w-4xl sm:p-6">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="min-w-0">
            <CardInformationForm card={card} listId={listId} />
          </div>
          <div className="min-w-0 space-y-2">
            <h2 className="text-center text-base font-semibold tracking-tight sm:text-lg">
              Card Members
            </h2>
            <CardMembersDataTable
              boardId={boardId}
              cardId={card.id}
              canRemoveMembers={canRemoveMembers}
            />
          </div>
        </div>
        {hasBoardPermission(userBoardPermissions, "card_delete") ? (
          <div className="mt-4 flex justify-end">
            <DeleteCardButton
              cardId={card.id}
              listId={listId}
              // onSuccess={() => setIsOpen(false)}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
