"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getBoardsControllerFindMyBoardsQueryKey,
  useBoardsControllerUpdate,
} from "@/lib/api/generated/boards/boards";
import { getErrorMessageByStatus } from "@/lib/errors/api-error";

type UseUpdateBoardMutationParams = {
  onSuccess?: () => void;
  onErrorMessage?: (message: string) => void;
};

export function useUpdateBoardMutation({
  onSuccess,
  onErrorMessage,
}: UseUpdateBoardMutationParams) {
  const queryClient = useQueryClient();
  const myBoardsQueryKey = getBoardsControllerFindMyBoardsQueryKey();

  return useBoardsControllerUpdate({
    mutation: {
      onSuccess: (res) => {
        if (res.status === 200) {
          toast.success("Board renamed.");
          queryClient.invalidateQueries({ queryKey: myBoardsQueryKey });
          onSuccess?.();
          return;
        }

        onErrorMessage?.(
          getErrorMessageByStatus(res.status, {
            400: "Invalid board name.",
            403: "You do not have permission to update this board.",
            404: "Board not found.",
          }),
        );
      },
      onError: () => {
        const message = "Something went wrong. Please try again.";
        toast.error(message);
        onErrorMessage?.(message);
      },
    },
  });
}
