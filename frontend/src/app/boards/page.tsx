import type { Metadata } from "next";
import BoardsGrid from "@/components/boards/BoardsGrid";

export const metadata: Metadata = {
  title: "My Boards",
};

export default function BoardsPage() {
  return <BoardsGrid />;
}
