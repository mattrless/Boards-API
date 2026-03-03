import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Type a valid email address"),
    password: z
      .string()
      .min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    avatar: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          !value || /^(https?:\/\/)([\w.-]+)(:[0-9]+)?(\/.*)?$/i.test(value),
        "Avatar must be a valid URL",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export default registerSchema;
