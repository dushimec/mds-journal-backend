// cloudinary.ts
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // always HTTPS
});

/**
 * Upload a buffer to Cloudinary with retry/backoff for transient DNS/network errors.
 * All files are uploaded as RAW and PUBLIC for exact download.
 */
export async function uploadBufferWithRetry(
  buffer: Buffer,
  options: Partial<UploadApiOptions> = {},
  maxRetries = 3
): Promise<any> {
  const streamifier = require("streamifier");

  const uploadOptions: UploadApiOptions = {
    resource_type: "raw", // exact original storage
    type: "upload",       // public
    ...options,
  };

  const isTransient = (err: any) => {
    if (!err) return false;
    const code = err.code || "";
    const msg = String(err.message || "");
    return (
      code === "ENOTFOUND" ||
      code === "EAI_AGAIN" ||
      /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET/.test(msg) ||
      /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET/.test(code)
    );
  };

  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, res) => {
            if (error) return reject(error);
            resolve(res);
          }
        );

        const read = streamifier.createReadStream(buffer);
        read.on("error", reject);
        uploadStream.on("error", reject);
        read.pipe(uploadStream);
      });

      return result;
    } catch (err: any) {
      if (attempt >= maxRetries || !isTransient(err)) throw err;
      const backoffMs = Math.min(2000, 200 * Math.pow(2, attempt));
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}

export default cloudinary;
