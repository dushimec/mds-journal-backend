
import "multer-storage-cloudinary";
import { v2 as Cloudinary } from "cloudinary";
import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

declare module "multer-storage-cloudinary" {
  interface Params {
    folder?: string;
    public_id?: string | ((req: Express.Request, file: Express.Multer.File) => string);
    resource_type?: string;
    format?: string;
    transformation?: any;
    access_mode?: string;
    allowed_formats?: string[];
    type?: string;
  }

  interface Options {
    cloudinary: typeof Cloudinary;
    Params?: Params | ((req: Express.Request, file: Express.Multer.File) => Params);
  }
}
