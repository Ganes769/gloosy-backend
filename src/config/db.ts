import mongoose from "mongoose";
import { env } from "../../env.ts";

// Cache the connection to reuse in serverless environments
let cachedConnection: typeof mongoose | null = null;

const connectDB = async () => {
  // Return existing connection if available (for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    // Reuse existing connection if mongoose is already connected
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose;
      return mongoose;
    }

    const conn = await mongoose.connect(env.DB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    // Don't exit process in serverless environment - throw error instead
    throw error;
  }
};

export default connectDB;
