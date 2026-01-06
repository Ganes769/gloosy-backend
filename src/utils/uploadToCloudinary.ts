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
