"use client";

import { useMemo, useState } from "react";

import { useBoardsControllerFindMyBoards } from "@/lib/api/generated/boards/boards";
import BoardCard from "@/components/boards/BoardCard";
import CreateBoardCard from "@/components/boards/CreateBoardCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BoardsTab = "all" | "owned" | "shared";

export default function BoardsGrid() {
  const [tab, setTab] = useState<BoardsTab>("all");
  const boardsQuery = useBoardsControllerFindMyBoards();

  const boards = useMemo(() => {
    if (!boardsQuery.data || boardsQuery.data.status !== 200) return [];

    const allBoards = boardsQuery.data.data;
    if (tab === "all") return allBoards;
    if (tab === "owned") return allBoards.filter((board) => board.isOwner);
    return allBoards.filter((board) => !board.isOwner);
  }, [boardsQuery.data, tab]);

  if (boardsQuery.isPending) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-8">
        <p className="text-sm text-muted-foreground">Loading boards...</p>
      </div>
    );
  }

  if (boardsQuery.isError) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-8">
        <p className="text-sm text-destructive">Could not load boards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as BoardsTab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="owned">Owned</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CreateBoardCard />
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>
    </div>
  );
}
