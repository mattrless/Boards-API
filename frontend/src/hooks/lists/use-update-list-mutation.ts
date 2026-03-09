"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getListsControllerFindAllQueryKey,
  useListsControllerUpdate,
} from "@/lib/api/generated/lists/lists";
import { getErrorMessageByStatus } from "@/lib/errors/api-error";

type UseUpdateListMutationParams = {
  boardId: number;
  onSuccess?: () => void;
  onErrorMessage?: (message: string) => void;
};

export function useUpdateListMutation({
  boardId,
  onSuccess,
  onErrorMessage,
}: UseUpdateListMutationParams) {
  const queryClient = useQueryClient();
  const listsQueryKey = getListsControllerFindAllQueryKey(boardId);

  return useListsControllerUpdate({
    mutation: {
      onSuccess: async (res) => {
        if (res.status === 200) {
          toast.success("List renamed.");
          await queryClient.invalidateQueries({ queryKey: listsQueryKey });
          onSuccess?.();
        } else {
          onErrorMessage?.(
            getErrorMessageByStatus(res.status, {
              400: "Invalid list title.",
              403: "You do not have permission to update this list.",
              404: "List not found.",
            }),
          );
        }
      },
      onError: () => {
        const message = "Something went wrong. Please try again.";
        onErrorMessage?.(message);
      },
    },
  });
}
