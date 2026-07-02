import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  base64Data: string,
  folder: string = 'rent-flatmate'
): Promise<{ url: string; publicId: string }> {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name'
  ) {
    // Return placeholder if cloudinary not configured
    return {
      url: `https://picsum.photos/seed/${Date.now()}/800/600`,
      publicId: `placeholder_${Date.now()}`,
    };
  }
  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    resource_type: 'auto',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name' ||
    publicId.startsWith('placeholder_')
  ) {
    return;
  }
  await cloudinary.uploader.destroy(publicId);
}
