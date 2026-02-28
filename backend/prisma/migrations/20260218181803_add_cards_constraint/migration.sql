/*
  Warnings:

  - A unique constraint covering the columns `[list_id,position]` on the table `cards` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cards_list_id_position_key" ON "cards"("list_id", "position");
