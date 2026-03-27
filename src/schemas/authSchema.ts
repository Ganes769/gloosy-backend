import { z } from "zod";

export const registerSchema = z.object({
  role: z.enum(["customer", "creator"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be either 'customer' or 'creator'",
  }),
  email: z
    .string({
      required_rror: "Email is required",
    })
    .email("Invalid email format"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long"),
  firstName: z
    .string({
      required_error: "First name is required",
    })
    .min(1, "First name cannot be empty")
    .trim(),
  lastName: z
    .string({
      required_error: "Last name is required",
    })
    .min(1, "Last name cannot be empty")
    .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
