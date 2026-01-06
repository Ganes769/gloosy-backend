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

export const loginZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const userProfileUpdateScehma = z.object({
  userid: z.string().optional(), // Optional since we get it from authenticated token
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date(),
  userName: z.string().optional(), // Optional - auto-generated from firstName + lastName
  description: z.string().min(1, "Description is required"),
  profilePicture: z.string().min(1, "Profile picture is required").optional(), // Optional if uploaded as file
  primarySkill: z.enum(["Video creation", "Photo Creation"]),
  experience: z.number().min(1, "Experience is required"),
});
