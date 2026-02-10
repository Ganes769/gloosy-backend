import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import DMMessage from "../model/dmMessage.ts";
import mongoose from "mongoose";

export const sendDMController = async (
  req: AuthenticatedRequest<{ receiverId: string; text: string; type?: "text"; clientMessageId?: string }>,
  res: Response
) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { receiverId, text, type = "text", clientMessageId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiverId" });
    }

    const message = await DMMessage.create({
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      text,
      type,
      ...(clientMessageId && { clientMessageId }),
    });

    const populated = await DMMessage.findById(message._id)
      .populate("senderId", "firstName lastName userName email")
      .populate("receiverId", "firstName lastName userName email")
      .lean();

    res.status(201).json(populated ?? message);
  } catch (error) {
    console.error("sendDM error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
