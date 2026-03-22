"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRemoveBoardMutation } from "@/hooks/boards/use-remove-board-mutation";

export default function DeleteBoardButton({
  boardId,
  boardName,
  disabled = true,
}: {
  boardId: number;
  boardName: string;
  disabled: boolean;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const removeBoardMutation = useRemoveBoardMutation({
    onSuccess: () => {
      router.push("/boards");
    },
  });

  function openDeleteDialog() {
    setIsDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setIsDeleteDialogOpen(false);
  }

  function handleDelete() {
    removeBoardMutation.mutate({ boardId });
    closeDeleteDialog();
  }

  return (
    <>
      <Button
        variant="destructive"
        disabled={disabled}
        className="w-full sm:w-auto"
        onClick={() => {
          openDeleteDialog();
        }}
      >
        Delete board
      </Button>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{`Delete Board?`}</AlertDialogTitle>
            <AlertDialogDescription className="max-w-full whitespace-normal">
              You are deleting <span className="break-all">"{boardName}"</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={disabled}
              className="w-full sm:w-auto"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
