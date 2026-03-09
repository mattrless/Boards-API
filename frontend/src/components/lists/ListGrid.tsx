import { useDraggable } from "@dnd-kit/react";
import ListCard from "./ListCard";
import { ListSummaryResponseDto } from "@/lib/api/generated/boardsAPI.schemas";

export default function ListGrid({
  lists,
}: {
  lists: ListSummaryResponseDto[];
}) {
  const { ref } = useDraggable({
    id: "draggable",
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex w-max gap-4">
        {lists.map((list) => (
          <ListCard list={list} key={list.id} />
        ))}
      </div>
    </div>
  );
}
