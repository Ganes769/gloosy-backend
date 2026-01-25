import { Router, type Request, type Response } from "express";
import userSchema from "../model/userSchema.ts";
import { authencitatedToken } from "../middleware/auth.ts";

const router = Router();
router.use(authencitatedToken);

export const getAllCreatorDetails = router.get(
  "/",
  async (req: Request, res: Response) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Number(req.query.limit) || 10, 100);
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        userSchema.find({ role: "creator" }).skip(skip).limit(limit).lean(),
        userSchema.countDocuments({ role: "creator" }),
      ]);

      res.status(200).json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch creators",
      });
    }
  },
);

export default router;
