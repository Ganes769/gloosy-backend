import { z } from "zod";

export const userZodSchema = z
  .object({
    role: z
      .enum(["customer", "creator"])
      .refine((v) => v === "customer" || v === "creator", {
        message: "Role must be either customer or creator",
      }),

    email: z.string().email("Invalid email format"),

    password: z.string().min(8, "Password must be at least 8 characters long"),

    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long"),

    firstName: z.string().min(1, "First name is required"),

    lastName: z.string().min(1, "Last name is required"),

    location: z.enum(["UK", "Nepal"], {
      message: "Location must be either UK or Nepal",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const userProfileUpdateScehma = z.object({
  userid: z.string().optional(), // Optional since we get it from authenticated token
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const date = new Date(val);
        return isNaN(date.getTime()) ? val : date;
      }
      return val;
    },
    z.date({ message: "Invalid date format for dateOfBirth" })
  ),
  userName: z.string().optional(), // Optional - auto-generated from firstName + lastName
  description: z.string().min(1, "Description is required"),
  profilePicture: z.string().optional(), // Optional - can be base64 string or will come as file
  // profilePicture file upload is handled separately via multipart/form-data
  primarySkill: z.enum(["Video creation", "Photo Creation"]),
  experience: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    },
    z.number().min(1, "Experience must be a number >= 1")
  ),
});
