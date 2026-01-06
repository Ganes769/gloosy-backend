import { z } from "zod";

export const googleSignInZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z
    .enum(["customer", "creator"])
    .refine((v) => v === "customer" || v === "creator", {
      message: "Role must be either customer or creator",
    }),
});
