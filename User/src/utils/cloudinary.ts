import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video" | "raw" | "auto";
}







const uploadOnCloudinary = async (
  localFilePath: string
): Promise<CloudinaryUploadResult | null> => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return {
      secure_url: response.secure_url,
      public_id: response.public_id,
      resource_type: response.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  } finally {
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (unlinkErr) {
      console.warn("Failed to delete local temp file:", unlinkErr);
    }
  }
};

export { uploadOnCloudinary };
