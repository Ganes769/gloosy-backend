import mongoose from "mongoose";
import { env } from "../../env.ts";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.DB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
