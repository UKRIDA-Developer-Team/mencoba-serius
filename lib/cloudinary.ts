import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with credentials from environment variables.
// These MUST be set in .env.local — never hardcode secrets.
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local"
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary.
 *
 * @param fileBuffer - The file content as a Buffer
 * @param filename   - Original filename (used to derive public_id)
 * @param folder     - Cloudinary folder (default: "products")
 * @returns { publicId, secureUrl }
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  folder = "products"
) {
  // Strip extension and sanitize for use as Cloudinary public_id
  const safeName = filename
    .toLowerCase()
    .replace(/\.[^.]+$/, "")          // remove extension
    .replace(/[^a-z0-9-_]/g, "-")     // keep only safe chars
    .replace(/-+/g, "-")              // collapse dashes
    .replace(/^-|-$/g, "");           // trim leading/trailing dashes

  const timestamp = Date.now();
  const publicId = `${folder}/${timestamp}-${safeName}`;

  return new Promise<{ publicId: string; secureUrl: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder,
          // f_auto: serve best format (webp, avif, etc.)
          // q_auto: serve best quality for the format
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload returned no result"));
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        }
      );

      uploadStream.end(fileBuffer);
    }
  );
}

/**
 * Delete an image from Cloudinary by its public_id.
 *
 * @param publicId - The Cloudinary public_id (e.g. "products/1234-chocolate-cake")
 */
export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Build an optimized Cloudinary URL for a given public_id.
 *
 * f_auto — serves the best modern format (webp/avif) for the client
 * q_auto — serves the best quality/size balance automatically
 *
 * Example output:
 *   https://res.cloudinary.com/dghlnryjd/image/upload/f_auto,q_auto/products/1234-chocolate-cake
 */
export function getOptimizedUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    transformation: [{ quality: "auto", fetch_format: "auto" }],
    secure: true,
  });
}

export default cloudinary;
