import { z } from "zod";

export const sendDMZodSchema = z.object({
  receiverId: z.string().min(1, "receiverId is required"),
  text: z.string().min(1, "text is required").trim(),
  type: z.enum(["text"]).optional().default("text"),
  clientMessageId: z.string().optional(),
});
