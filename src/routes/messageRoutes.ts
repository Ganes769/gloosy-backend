import { Router } from "express";
import { validateBody } from "../middleware/validateBody.ts";
import { sendDMZodSchema } from "../schemas/sendDMInput.ts";
import { sendDMController } from "../controllers/messageController.ts";
import { authencitatedToken } from "../middleware/auth.ts";

const router = Router();

router.post("/dm", authencitatedToken, validateBody(sendDMZodSchema), sendDMController);

export default router;
