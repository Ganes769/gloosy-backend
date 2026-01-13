import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.ts";

export interface RequestWithUserId extends Request {
  userId?: string;
}

export const getUserId = async (
  req: RequestWithUserId,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const payload = await verifyToken(token);
    req.userId = payload.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
