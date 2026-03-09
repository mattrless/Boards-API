"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessageByStatus } from "@/lib/errors/api-error";
import {
  getListsControllerFindAllQueryKey,
  useListsControllerRemove,
} from "@/lib/api/generated/lists/lists";

export function useRemoveListMutation(boardId: number) {
  const queryClient = useQueryClient();

  return useListsControllerRemove({
    mutation: {
      onSuccess: (res) => {
        if (res.status === 200) {
          toast.success("List deleted.");
          queryClient.invalidateQueries({
            queryKey: getListsControllerFindAllQueryKey(boardId),
          });
          return;
        }

        toast.error(
          getErrorMessageByStatus(res.status, {
            403: "You do not have permission to delete this list.",
            404: "List not found.",
          }),
        );
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    },
  });
}
