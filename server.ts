import express from "express";
import authRoutes from "./src/routes/authRoutes.ts";
import cors from "cors";
import { userProfileRoutes } from "./src/routes/userProfileRoutes.ts";
import { authencitatedToken } from "./src/middleware/auth.ts";
import { getCurrentUserController } from "./src/controllers/userProfileController.ts";
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/api/auth", authRoutes);
app.get("/api/me", authencitatedToken, getCurrentUserController);
app.use("/profile", userProfileRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});
export { app };
export default app;
