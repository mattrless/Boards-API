import {
  getCardsControllerFindAllQueryKey,
  useCardsControllerRemove,
} from "@/lib/api/generated/cards/cards";
import { Button } from "../ui/button";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getBoardsControllerFindOneQueryKey } from "@/lib/api/generated/boards/boards";

export default function DeleteCardButton({
  cardId,
  listId,
  onSuccess,
}: {
  cardId: number;
  listId: number;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const deleteCardMutation = useCardsControllerRemove({
    mutation: {
      onSuccess: () => {
        toast.success("Card removed");
        queryClient.invalidateQueries({
          queryKey: getBoardsControllerFindOneQueryKey(boardId),
        });
        queryClient.invalidateQueries({
          queryKey: getCardsControllerFindAllQueryKey(boardId, listId),
        });
        onSuccess?.();
      },
      onError: () => {
        toast.error("Something went wrong, try again");
      },
    },
  });
  const boardId = useBoardIdParam();

  const handleDeleteCard = () => {
    deleteCardMutation.mutate({ boardId, cardId, listId });
  };

  return (
    <Button
      variant={"destructive"}
      onClick={handleDeleteCard}
      disabled={deleteCardMutation.isPending}
      className="w-full sm:w-auto"
    >
      Delete card
    </Button>
  );
}
