import { v2 as cloudinary } from "cloudinary";
import { env } from "../../env.ts";

// Validate Cloudinary credentials
const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  const missing = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  console.error(
    `❌ Cloudinary configuration error: Missing environment variables: ${missing.join(
      ", "
    )}`
  );
  console.error(
    "Please ensure these are set in your .env file or environment variables"
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Verify configuration on module load
if (cloudName && apiKey && apiSecret) {
  console.log("✅ Cloudinary configured successfully");
} else {
  console.warn("⚠️  Cloudinary not fully configured - uploads will fail");
}

export { cloudinary };
