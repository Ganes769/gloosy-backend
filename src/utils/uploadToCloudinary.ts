import { cloudinary } from "../config/cloudinary.ts";

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options?: { folder?: string; public_id?: string }
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    // Validate buffer
    if (!buffer || buffer.length === 0) {
      return reject(new Error("Cannot upload empty buffer"));
    }

    // Validate Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return reject(new Error("Cloudinary cloud name not configured"));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder ?? "profiles",
        public_id: options?.public_id,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", {
            message: error.message,
            http_code: (error as any).http_code,
            name: error.name,
          });
          return reject(
            new Error(
              `Cloudinary upload failed: ${error.message}${
                (error as any).http_code
                  ? ` (HTTP ${(error as any).http_code})`
                  : ""
              }`
            )
          );
        }
        if (!result) {
          return reject(new Error("Cloudinary upload returned no result"));
        }
        if (!result.secure_url) {
          return reject(
            new Error("Cloudinary upload succeeded but no URL returned")
          );
        }
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

    stream.on("error", (streamError) => {
      console.error("Cloudinary stream error:", streamError);
      reject(
        new Error(
          `Cloudinary stream error: ${
            streamError instanceof Error ? streamError.message : "Unknown error"
          }`
        )
      );
    });

    stream.end(buffer);
  });
}

/**
 * Converts a base64 string or data URL to a Buffer
 * Handles both formats:
 * - "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 * - "/9j/4AAQSkZJRg..." (just the base64 part)
 */
export function base64ToBuffer(base64String: string): Buffer {
  if (!base64String || typeof base64String !== "string") {
    throw new Error("Invalid base64 string: must be a non-empty string");
  }

  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  let base64Data: string;
  if (base64String.includes(",")) {
    base64Data = base64String.split(",")[1];
  } else {
    base64Data = base64String;
  }

  // Remove any whitespace
  base64Data = base64Data.trim();

  if (!base64Data || base64Data.length === 0) {
    throw new Error("Invalid base64 string: empty after parsing");
  }

  try {
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length === 0) {
      throw new Error("Invalid base64 string: resulted in empty buffer");
    }
    return buffer;
  } catch (error) {
    throw new Error(
      `Failed to decode base64 string: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
