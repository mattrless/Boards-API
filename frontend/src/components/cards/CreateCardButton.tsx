import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateCardForm from "./CreateCardForm";

export default function CreateCardButton({
  boardId,
  listId,
}: {
  boardId: number;
  listId: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleOpenForm() {
    setIsExpanded(true);
  }

  function handleCancel() {
    setIsExpanded(false);
  }

  return (
    <>
      {!isExpanded ? (
        <Button
          variant="ghost"
          className="w-full min-w-0 justify-start"
          onClick={handleOpenForm}
        >
          <Plus className="h-4 w-4" /> Add card
        </Button>
      ) : (
        <>
          <CreateCardForm
            boardId={boardId}
            listId={listId}
            onSuccess={handleCancel}
            onCancel={handleCancel}
          />
        </>
      )}
    </>
  );
}
