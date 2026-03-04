import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().trim().min(1, "Board name is required"),
});

export type CreateBoardSchema = z.infer<typeof createBoardSchema>;

export default createBoardSchema;
