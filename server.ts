import express from "express";
import connectDB from "./src/config/db.ts";
import { authRoutes } from "./src/routes/authRoutes.ts";
const app = express();
connectDB();

// Middleware to parse JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/api/auth", authRoutes);

export { app };
export default app;
