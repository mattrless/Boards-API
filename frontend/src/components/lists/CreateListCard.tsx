"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CreateListForm from "./CreateListForm";
import { cn } from "@/lib/utils";

export default function CreateBoardCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleOpenForm() {
    setIsExpanded(true);
  }

  function handleCancel() {
    setIsExpanded(false);
  }

  return (
    <Card
      className={cn(
        "min-w-72 self-start overflow-hidden",
        !isExpanded && "gap-0 py-0",
      )}
    >
      {!isExpanded ? (
        <CardContent className="p-0">
          <Button
            type="button"
            variant="ghost"
            className="min-h-17 w-full justify-center gap-2 rounded-none"
            onClick={handleOpenForm}
          >
            <Plus className="h-4 w-4" />
            New list
          </Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="pt-0">
            <CreateListForm onSuccess={handleCancel} onCancel={handleCancel} />
          </CardContent>
        </>
      )}
    </Card>
  );
}
