"use client";

import ListGrid from "@/components/lists/ListGrid";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";
import { ListSummaryResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import { useListsControllerFindAll } from "@/lib/api/generated/lists/lists";

export default function BoardPage() {
  const boardId = useBoardIdParam();

  const { data, isPending } = useListsControllerFindAll(boardId);

  if (isPending) return <div>Loading...</div>;
  if (data?.status !== 200) return <div>Error</div>;

  const lists: ListSummaryResponseDto[] = data.data;

  return (
    <>
      <ListGrid lists={lists} />
    </>
  );
}
