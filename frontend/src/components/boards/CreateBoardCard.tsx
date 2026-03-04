"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import CreateBoardForm from "@/components/boards/CreateBoardForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateBoardCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleOpenForm() {
    setIsExpanded(true);
  }

  function handleCancel() {
    setIsExpanded(false);
  }

  return (
    <Card className="border-dashed py-0">
      <CardContent className="flex min-h-40 items-center justify-center py-4">
        {!isExpanded ? (
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={handleOpenForm}
          >
            <Plus className="h-4 w-4" />
            New board
          </Button>
        ) : (
          <div className="flex w-full max-w-sm flex-col gap-3">
            <CreateBoardForm onSuccess={handleCancel} onCancel={handleCancel} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
