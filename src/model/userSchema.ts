import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["customer", "creator"] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    userName: { type: String, unique: true, sparse: true },
    description: { type: String },
    profilePicture: { type: String },
    primarySkill: {
      type: String,
      enum: ["Video creation", "Photo Creation"],
    },
    experience: { type: Number, min: 1 },
  },
  {
    versionKey: false,
  }
);

userSchema.pre("save", async function () {
  if (this.firstName && this.lastName) {
    this.userName = `${this.firstName} ${this.lastName}`.trim();
  }
});

export default mongoose.model("User", userSchema);
