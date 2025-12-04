import cloudinary from "../utils/cloudinary";

console.log("Cloudinary config check:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? "✅ set" : "❌ missing",
  secret: process.env.CLOUDINARY_API_SECRET ? "✅ set" : "❌ missing",
});
export default cloudinary;

