import { cloudinary } from "../config/cloudinary.ts";

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options?: { folder?: string; public_id?: string }
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder ?? "profiles",
        public_id: options?.public_id,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

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
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;

  return Buffer.from(base64Data, "base64");
}
