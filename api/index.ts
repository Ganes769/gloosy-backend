import type { Request, Response } from "express";
import mongoose from "mongoose";
import app from "../server.ts";
import connectDB from "../src/config/db.ts";

// Track if DB is connected (reused across invocations in serverless)
let dbConnected = false;

export default async function handler(req: Request, res: Response) {
  // Connect to database once (connection is reused in serverless)
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error("Database connection error:", error);
      // Don't fail the request if DB connection fails on subsequent calls
      // The connection might already be established
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({
          error: "Database connection failed",
          message: "Unable to connect to database",
        });
      }
    }
  }

  // Pass request to Express app
  return app(req, res);
}
