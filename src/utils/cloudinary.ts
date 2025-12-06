import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


export async function uploadBufferWithRetry(
  buffer: Buffer,
  options: Partial<UploadApiOptions> = {},
  maxRetries = 3
): Promise<any> {
  const streamifier = require("streamifier");

  const uploadOptions: UploadApiOptions = {
    resource_type: "raw",
    type: "upload",     
    ...options,
  };

  const isTransient = (err: any) => {
    if (!err) return false;
    const code = err.code || "";
    const msg = String(err.message || "");
    const httpCode = err.http_code || err.statusCode || err.status || null;

    return (
      code === "ENOTFOUND" ||
      code === "EAI_AGAIN" ||
      err.name === "TimeoutError" ||
      /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET/.test(msg) ||
      /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET/.test(code) ||
      /request timeout|request timed out|timeout/i.test(msg) ||
      httpCode === 499 ||
      (typeof httpCode === "number" && httpCode >= 500)
    );
  };

  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      const uploadPromise: Promise<any> = new Promise((resolve, reject) => {
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

      const timeoutMs = 5 * 60 * 1000; 
      const timeoutPromise = new Promise((_, reject) => {
        const e: any = new Error("Request Timeout");
        e.name = "TimeoutError";
        e.http_code = 499;
        const t = setTimeout(() => reject(e), timeoutMs);
        uploadPromise.finally(() => clearTimeout(t));
      });

      const result: any = await Promise.race([uploadPromise, timeoutPromise]);

      return result;
    } catch (err: any) {
      if (attempt >= maxRetries || !isTransient(err)) throw err;
      const backoffMs = Math.min(5000, 200 * Math.pow(2, attempt));
      console.warn(
        `Cloudinary upload transient error (attempt ${attempt}/${maxRetries}): ${
          err?.message || err
        }. Retrying in ${backoffMs}ms.`
      );
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}

export default cloudinary;
