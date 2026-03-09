import { z } from "zod";

export const updateListSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "List name is required.")
    .max(50, "List name must be 50 characters or less."),
});

export type UpdateListSchema = z.infer<typeof updateListSchema>;

export default updateListSchema;
