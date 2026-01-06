import type { NextFunction, Request, Response } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.ts";
export interface AuthenticatedRequest<TBody = any>
  extends Request<any, any, TBody> {
  user?: JwtPayload;
}

export const authencitatedToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "bad request not authrozed" });
    }
    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ messgae: "forbiddenß" });
  }
};
