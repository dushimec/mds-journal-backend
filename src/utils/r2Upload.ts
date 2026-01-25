import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./r2Client";
import { logger } from "./logger";
import "dotenv/config";


export const uploadToR2 = async ({
  buffer,
  key,
  contentType,
}: {
  buffer: Buffer;
  key: string;
  contentType: string;
}) => {
  if (!process.env.CF_R2_BUCKET) {
    throw new Error("CF_R2_BUCKET environment variable is not set");
  }

  if (!process.env.CF_R2_PUBLIC_URL) {
    throw new Error("CF_R2_PUBLIC_URL environment variable is not set");
  }

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CF_R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read", // 🔓 public like Emerald
      })
    );

    return `${process.env.CF_R2_PUBLIC_URL}/${key}`;
  } catch (error: any) {
    logger.error("R2 Upload Error", {
      message: error.message,
      code: error.code,
      key,
    });
    throw error;
  }
};
