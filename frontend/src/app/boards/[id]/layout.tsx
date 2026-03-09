"use client";

import { notFound } from "next/navigation";

import BoardsWorkspaceLayoutShell from "@/components/layout/BoardsWorkspaceLayoutShell";
import { Crumb } from "@/lib/types/Crumb";
import { useBoardsControllerFindOne } from "@/lib/api/generated/boards/boards";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const boardId = useBoardIdParam();
  const boardQuery = useBoardsControllerFindOne(boardId);

  if (boardQuery.data?.status === 404) {
    notFound();
  }

  let boardName = "Board";
  if (boardQuery.isPending) {
    boardName = "Loading...";
  } else if (boardQuery.data?.status === 200) {
    boardName = boardQuery.data.data.name;
  }

  const crumbs: Crumb[] = [
    { title: "Boards", href: "/boards" },
    { title: boardName },
  ];

  return (
    <BoardsWorkspaceLayoutShell
      requiredPermission="board_read_full_board"
      crumbs={crumbs}
    >
      {children}
    </BoardsWorkspaceLayoutShell>
  );
}
