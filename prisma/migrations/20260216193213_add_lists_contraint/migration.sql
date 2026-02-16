/*
  Warnings:

  - A unique constraint covering the columns `[board_id,position]` on the table `lists` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "lists_board_id_position_key" ON "lists"("board_id", "position");
