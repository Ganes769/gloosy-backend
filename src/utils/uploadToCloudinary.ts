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
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      const missing = [];
      if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
      if (!apiKey) missing.push("CLOUDINARY_API_KEY");
      if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
      
      return reject(
        new Error(
          `Cloudinary credentials not configured. Missing: ${missing.join(", ")}. ` +
          "Please check your environment variables."
        )
      );
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder ?? "profiles",
        public_id: options?.public_id,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          const httpCode = (error as any).http_code;
          const errorMessage = error.message;
          
          console.error("Cloudinary upload error:", {
            message: errorMessage,
            http_code: httpCode,
            name: error.name,
          });

          // Provide helpful error messages for common issues
          if (httpCode === 401) {
            return reject(
              new Error(
                `Cloudinary authentication failed (HTTP 401). ` +
                `This usually means your CLOUDINARY_API_SECRET is incorrect or missing. ` +
                `Please verify your Cloudinary credentials in your environment variables. ` +
                `Original error: ${errorMessage}`
              )
            );
          }

          return reject(
            new Error(
              `Cloudinary upload failed: ${errorMessage}${
                httpCode ? ` (HTTP ${httpCode})` : ""
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
