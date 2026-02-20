-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_list_id_fkey";

-- DropForeignKey
ALTER TABLE "card_assignments" DROP CONSTRAINT "card_assignments_card_id_fkey";

-- AddForeignKey
ALTER TABLE "cards"
ADD CONSTRAINT "cards_list_id_fkey"
FOREIGN KEY ("list_id") REFERENCES "lists"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_assignments"
ADD CONSTRAINT "card_assignments_card_id_fkey"
FOREIGN KEY ("card_id") REFERENCES "cards"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
