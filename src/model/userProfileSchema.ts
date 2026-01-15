import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // userId as string
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    userName: { type: String, unique: true, sparse: true }, // sparse avoids issues when missing
    description: { type: String },
    profilePicture: { type: String },
    primarySkill: {
      type: String,
      enum: ["Video creation", "Photo Creation"],
    },
    experience: { type: Number, min: 1 },
  },
  {
    timestamps: true,
  }
);

// Auto-generate userName from firstName + lastName before saving
userProfileSchema.pre("save", async function () {
  if (this.firstName && this.lastName) {
    this.userName = `${this.firstName} ${this.lastName}`.trim();
  }
});

export default mongoose.model("UserProfile", userProfileSchema);
