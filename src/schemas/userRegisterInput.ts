import { z } from "zod";

export const userZodSchema = z.object({
  role: z
    .enum(["customer", "creator"])
    .refine((v) => v === "customer" || v === "creator", {
      message: "Role must be either customer or creator",
    }),

  email: z.string().email("Invalid email format"),

  password: z.string().min(8, "Password must be at least 8 characters long"),

  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().min(1, "Last name is required"),
});
