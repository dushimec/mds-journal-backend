import { upload as multerInstance, uploadSingle, uploadMultiple } from "../utils/multer";

// Re-export the multer instance so files that expect `upload.single(...)` work
export const upload = multerInstance;

export const singleUpload = (fieldName: string) => uploadSingle(fieldName);

export const multipleUpload = (fieldName: string) => uploadMultiple(fieldName);
