// src/routes/userProfileRoutes.ts
import { Router, type Response } from "express";
import {
  authencitatedToken,
  type AuthenticatedRequest,
} from "../middleware/auth.ts";
import { validateBody } from "../middleware/validateBody.ts";
import { userProfileUpdateScehma } from "../schemas/userRegisterInput.ts";
import {
  uploadBufferToCloudinary,
  base64ToBuffer,
} from "../utils/uploadToCloudinary.ts";
import { upload } from "../middleware/photoUpload.ts";
import UserProfile from "../model/userProfileSchema.ts";
import User from "../model/userSchema.ts";

const router = Router();
router.use(authencitatedToken);

export const userProfileRoutes = router.post(
  "/",
  upload.single("profilePicture"),
  validateBody(userProfileUpdateScehma),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "User ID not found" });

      const {
        firstName,
        lastName,
        dateOfBirth,
        description,
        primarySkill,
        experience,
        profilePicture, // Can be a base64 string or data URL
      } = req.body;

      // Auto-generate userName from firstName + lastName
      let generatedUserName: string | undefined;
      if (firstName && lastName) {
        generatedUserName = `${firstName} ${lastName}`.trim();
      }

      // ✅ build update object WITHOUT undefined values
      const updateData: Record<string, any> = {};
      const raw = {
        firstName,
        lastName,
        dateOfBirth,
        userName: generatedUserName,
        description,
        primarySkill,
        experience,
      };

      for (const [k, v] of Object.entries(raw)) {
        if (v !== undefined) updateData[k] = v;
      }

      // ✅ multipart/form-data sends numbers/dates as strings
      if (updateData.experience !== undefined) {
        const num = Number(updateData.experience);
        if (!Number.isNaN(num)) updateData.experience = num;
      }

      if (updateData.dateOfBirth !== undefined) {
        const d = new Date(updateData.dateOfBirth);
        if (!Number.isNaN(d.getTime())) updateData.dateOfBirth = d;
      }

      // ✅ Upload profile picture to Cloudinary FIRST if provided
      // Priority: 1) File upload (multer) > 2) Base64 string in body
      let profilePictureUrl: string | undefined;

      if (req.file?.buffer) {
        // Handle file upload via multer
        try {
          const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
            folder: "profile-pictures",
            public_id: `user_${userId}`,
          });
          profilePictureUrl = uploaded.secure_url;
        } catch (error) {
          return res.status(400).json({
            error: "Upload failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to upload profile picture to Cloudinary",
          });
        }
      } else if (profilePicture && typeof profilePicture === "string") {
        // Handle base64 string or data URL from request body
        try {
          // Check if it's already a URL (don't re-upload)
          if (
            profilePicture.startsWith("http://") ||
            profilePicture.startsWith("https://")
          ) {
            profilePictureUrl = profilePicture;
          } else {
            // Convert base64 to buffer and upload to Cloudinary
            const imageBuffer = base64ToBuffer(profilePicture);
            const uploaded = await uploadBufferToCloudinary(imageBuffer, {
              folder: "profile-pictures",
              public_id: `user_${userId}`,
            });
            profilePictureUrl = uploaded.secure_url;
          }
        } catch (error) {
          return res.status(400).json({
            error: "Upload failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to upload profile picture to Cloudinary",
          });
        }
      }

      // Add profile picture URL to update data if we have one
      if (profilePictureUrl) {
        updateData.profilePicture = profilePictureUrl;
      }

      // ✅ prevent empty upsert inserting just _id
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No fields provided to update." });
      }

      const userProfile = await UserProfile.findOneAndUpdate(
        { _id: userId },
        { $set: updateData },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      // Also update User collection with the profile fields
      const userUpdateData: Record<string, any> = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      if (generatedUserName !== undefined)
        userUpdateData.userName = generatedUserName;
      if (dateOfBirth !== undefined) {
        const d = new Date(dateOfBirth);
        if (!Number.isNaN(d.getTime())) userUpdateData.dateOfBirth = d;
      }
      if (description !== undefined) userUpdateData.description = description;
      if (primarySkill !== undefined)
        userUpdateData.primarySkill = primarySkill;
      if (experience !== undefined) {
        const num = Number(experience);
        if (!Number.isNaN(num)) userUpdateData.experience = num;
      }
      if (profilePictureUrl) {
        userUpdateData.profilePicture = profilePictureUrl;
      }

      if (Object.keys(userUpdateData).length > 0) {
        await User.findByIdAndUpdate(
          userId,
          { $set: userUpdateData },
          { runValidators: true, new: true }
        );
      }

      return res.status(200).json({
        message: "User profile updated successfully",
        userProfile,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
