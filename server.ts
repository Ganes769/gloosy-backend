import express from "express";
import authRoutes from "./src/routes/authRoutes.ts";
import messageRoutes from "./src/routes/messageRoutes.ts";
import cors from "cors";
import { userProfileRoutes } from "./src/routes/userProfileRoutes.ts";
import { authencitatedToken } from "./src/middleware/auth.ts";
import { getCurrentUserController } from "./src/controllers/userProfileController.ts";
import Message from "./src/model/message.ts";
import { Server } from "socket.io";
import http from "http";
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.use(express.static("public"));
app.get("/messages", async (req, res) => {
  const room = (req.query.room as string) || "global";
  const messages = await Message.find({ room })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(messages.reverse());
});
io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("joinRoom", ({ room }) => {
    socket.join(room || "global");
  });

  socket.on("chatMessage", async (payload) => {
    const room = payload.room || "global";

    const saved = await Message.create({
      username: payload.username,
      text: payload.text,
      room,
    });

    console.log("Saved message id:", saved._id.toString());
    io.to(room).emit("newMessage", saved);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

app.use("/api/auth", authRoutes);
app.get("/api/me", authencitatedToken, getCurrentUserController);
app.use("/api/messages", messageRoutes);
app.use("/profile", userProfileRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});
export { app, server };
export default app;
