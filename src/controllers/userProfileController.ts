import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import userProfileSchema from "../model/userProfileSchema.ts";
import userSchema from "../model/userSchema.ts";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.ts";
import mongoose from "mongoose";

/**
 * Interface for user profile update request body
 */
export interface UserProfileUpdateBody {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  userName: string;
  description: string;
  profilePicture?: string;
  primarySkill: "Video creation" | "Photo Creation";
  experience: number;
}

/**
 * Interface for profile update data
 */
interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  userName: string;
  description: string;
  profilePicture: string;
  primarySkill: "Video creation" | "Photo Creation";
  experience: number;
}

/**
 * Handles profile picture upload and returns the URL
 */
const handleProfilePictureUpload = async (
  file: Express.Multer.File | undefined,
  userId: string,
  existingProfilePicture?: string
): Promise<string> => {
  // Priority: uploaded file > existing URL from body
  if (file?.buffer) {
    const uploaded = await uploadBufferToCloudinary(file.buffer, {
      folder: "profile-pictures",
      public_id: `user_${userId}`,
    });
    return uploaded.secure_url;
  }

  if (existingProfilePicture) {
    return existingProfilePicture;
  }

  throw new Error("Profile picture is required");
};

/**
 * Builds the profile update data object
 */
const buildProfileUpdateData = (
  body: UserProfileUpdateBody,
  profilePictureUrl: string
): ProfileUpdateData => {
  // Auto-generate userName from firstName + lastName
  const generatedUserName = `${body.firstName} ${body.lastName}`.trim();

  return {
    firstName: body.firstName,
    lastName: body.lastName,
    dateOfBirth: body.dateOfBirth,
    userName: generatedUserName,
    description: body.description,
    profilePicture: profilePictureUrl,
    primarySkill: body.primarySkill,
    experience: body.experience,
  };
};

/**
 * Builds the user update data object (only includes fields that exist in User schema)
 */
const buildUserUpdateData = (
  profileData: ProfileUpdateData
): Partial<ProfileUpdateData> => {
  const userUpdateData: Partial<ProfileUpdateData> = {};

  if (profileData.firstName !== undefined && profileData.firstName !== null) {
    userUpdateData.firstName = profileData.firstName;
  }
  if (profileData.lastName !== undefined && profileData.lastName !== null) {
    userUpdateData.lastName = profileData.lastName;
  }
  if (
    profileData.dateOfBirth !== undefined &&
    profileData.dateOfBirth !== null
  ) {
    userUpdateData.dateOfBirth = profileData.dateOfBirth;
  }
  if (profileData.userName !== undefined && profileData.userName !== null) {
    userUpdateData.userName = profileData.userName;
  }
  if (
    profileData.description !== undefined &&
    profileData.description !== null
  ) {
    userUpdateData.description = profileData.description;
  }
  if (
    profileData.primarySkill !== undefined &&
    profileData.primarySkill !== null
  ) {
    userUpdateData.primarySkill = profileData.primarySkill;
  }
  if (profileData.experience !== undefined && profileData.experience !== null) {
    userUpdateData.experience = profileData.experience;
  }
  if (
    profileData.profilePicture !== undefined &&
    profileData.profilePicture !== null
  ) {
    userUpdateData.profilePicture = profileData.profilePicture;
  }

  return userUpdateData;
};

/**
 * Updates user profile in both UserProfile and User collections
 */
export const updateUserProfileController = async (
  req: AuthenticatedRequest<UserProfileUpdateBody>,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User ID not found in token",
      });
    }

    const updateBody = req.body;
    const file = req.file;

    // Handle profile picture upload
    let profilePictureUrl: string;
    try {
      profilePictureUrl = await handleProfilePictureUpload(
        file,
        userId,
        updateBody.profilePicture
      );
    } catch (error) {
      return res.status(400).json({
        error: "Profile picture required",
        message:
          error instanceof Error
            ? error.message
            : "Profile picture is required",
      });
    }

    // Build profile update data
    const profileUpdateData = buildProfileUpdateData(
      updateBody,
      profilePictureUrl
    );

    // Update or create user profile
    const userProfile = await userProfileSchema.findOneAndUpdate(
      { _id: userId },
      {
        $set: profileUpdateData,
        $setOnInsert: { _id: userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (!userProfile) {
      return res.status(500).json({
        error: "Database error",
        message: "Failed to create or update user profile",
      });
    }

    // Sync profile data to User collection (including dateOfBirth, description, experience, primarySkill)
    const userUpdateData = buildUserUpdateData(profileUpdateData);

    if (Object.keys(userUpdateData).length > 0) {
      try {
        await userSchema.findByIdAndUpdate(
          userId,
          { $set: userUpdateData },
          { runValidators: true, new: true }
        );
      } catch (error) {
        // Log error but don't fail the request if User update fails
        // The profile was successfully updated
        if (error instanceof mongoose.Error.ValidationError) {
          console.error("Validation error updating User collection:", error);
        } else if (
          error instanceof mongoose.Error &&
          (error as any).code === 11000
        ) {
          console.error("Duplicate key error updating User collection:", error);
        } else {
          console.error("Error syncing to User collection:", error);
        }
      }
    }

    return res.status(200).json({
      message: "User profile updated successfully",
      userProfile,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        error: "Validation error",
        details: errors,
      });
    }

    // Handle duplicate key error
    if (error instanceof mongoose.Error && (error as any).code === 11000) {
      const field = Object.keys((error as any).keyPattern)[0];
      return res.status(409).json({
        error: "Duplicate entry",
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
