import express from "express";
import authRoutes from "./src/routes/authRoutes.ts";
import cors from "cors";
import { userProfileRoutes } from "./src/routes/userProfileRoutes.ts";
const app = express();

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/api/auth", authRoutes);
app.use("/profile", userProfileRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});
export { app };
export default app;
