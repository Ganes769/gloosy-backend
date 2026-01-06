import { Router } from "express";
import { validateBody } from "../middleware/validateBody.ts";
import { loginZodSchema, userZodSchema } from "../schemas/userRegisterInput.ts";
import { googleSignInZodSchema } from "../schemas/googleSignInInput.ts";
import {
  loginController,
  registerController,
  googleSignInController,
} from "../controllers/authController.ts";

const router = Router();

router.post("/register", validateBody(userZodSchema), registerController);

router.post("/login", validateBody(loginZodSchema), loginController);

router.post(
  "/google-login",
  validateBody(googleSignInZodSchema),
  googleSignInController
);

export default router;
