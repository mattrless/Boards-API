import { z } from "zod";

export const updateBoardNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Board name is required.")
    .max(50, "Board name must be 50 characters or less."),
});

export type UpdateBoardNameSchema = z.infer<typeof updateBoardNameSchema>;

export default updateBoardNameSchema;
