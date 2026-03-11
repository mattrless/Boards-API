import { z } from "zod";

export const updateCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Card name is required.")
    .max(50, "Card name must be 50 characters or less."),
});

export type UpdateCardSchema = z.infer<typeof updateCardSchema>;

export default updateCardSchema;
