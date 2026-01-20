import { Router, type Request, type Response } from "express";
import userSchema from "../model/userSchema.ts";
import { authencitatedToken } from "../middleware/auth.ts";
const router = Router();
router.use(authencitatedToken);
export const getAllCreatorDetails = router.get("/", async (req, res) => {
  const users = await userSchema.find({ role: "creator" });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});
