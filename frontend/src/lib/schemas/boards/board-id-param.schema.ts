import { z } from "zod";

export const boardIdParamSchema = z.coerce.number().int().positive();

export type BoardIdParamSchema = z.infer<typeof boardIdParamSchema>;

export default boardIdParamSchema;
