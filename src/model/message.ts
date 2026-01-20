import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    room: { type: String, default: "global" },
  },
  { timestamps: true },
);
export default mongoose.model("Message", messageSchema);
