import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Type a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export default loginSchema;
