import type { Request, Response } from "express";
import { Router } from "express";
import userSchema from "../model/userSchema.ts";
import { hashPassword } from "../utils/hashPassword.ts";
import { generateToken } from "../utils/jwt.ts";
import { validateBody } from "../middleware/validateBody.ts";
import mongoose from "mongoose";
import { userZodSchema } from "../schemas/userRegisterInput.ts";

const router = Router();

router.post(
  "/register",
  validateBody(userZodSchema),
  async (req: Request, res: Response) => {
    try {
      const { role, email, password, firstName, lastName } = req.body;
      const user = await userSchema.create({
        role,
        email,
        firstName,
        lastName,
        password: await hashPassword(password),
      });
      const token = await generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      res
        .status(201)
        .json({ message: "user created successfully", token: token });
      console.log(user);
    } catch (error) {
      console.log(error);

      // Handle Mongoose validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          error: "Validation error",
          details: errors,
        });
      }

      // Handle duplicate key error (e.g., duplicate email)
      if (error instanceof mongoose.Error && (error as any).code === 11000) {
        const field = Object.keys((error as any).keyPattern)[0];
        return res.status(409).json({
          error: "Duplicate entry",
          message: `${field} already exists`,
        });
      }

      res.status(500).json({ message: "server error" });
    }
  }
);

export const authRoutes = router;
