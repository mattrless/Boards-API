import { z } from "zod";

export const createCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Card name is required.")
    .max(50, "Card name must be 50 characters or less."),
});

export type CreateCardSchema = z.infer<typeof createCardSchema>;

export default createCardSchema;
