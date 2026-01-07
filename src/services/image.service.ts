import { createAdminClient } from "@/lib/supabase/admin";

export interface UploadImageResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export class ImageService {
  private defaultBucket = "menu-image";
  private allowedBuckets = ["menu-image", "nid-documents", "kitchen-images", "avatars"];
  private allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
  private defaultMaxSize = 10 * 1024 * 1024; // 10MB

  /**
   * Upload image to Supabase Storage
   * @param file - File object from form
   * @param folder - Folder path (e.g., 'chef-menu', 'dishes')
   * @returns Upload result with public URL
   */
  async uploadImage(
    file: File,
    folder: string = "chef-menu",
    bucket: string = this.defaultBucket,
    maxSize: number = this.defaultMaxSize,
    allowedTypes: string[] = this.allowedTypes
  ): Promise<UploadImageResult> {
    try {
   //   console.log(`\n=== ImageService: uploadImage STARTED ===`);
     // console.log(`File details:`, { name: file.name, size: file.size, type: file.type, folder, bucket });

      if (!file) {
    //    console.log("No file provided");
        return { success: false, error: "No file provided" };
      }

      if (!this.allowedBuckets.includes(bucket)) {
     //   console.log("Invalid bucket:", bucket);
        return { success: false, error: "Invalid bucket" };
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
      //  console.log("Invalid file type:", file.type);
        return { success: false, error: "Invalid file type. Only JPEG, PNG, WebP, and GIF allowed." };
      }

      // Validate file size (max 5MB)
      if (file.size > maxSize) {
      //  console.log("File size exceeds limit:", file.size, "bytes");
        return { success: false, error: "File size exceeds limit" };
      }

    //  console.log("File validation passed");
      const supabase = createAdminClient();

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split(".").pop() || "jpg";
      const fileName = `${timestamp}-${random}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

     // console.log("Generated file path:", filePath);

      // Upload to Supabase
     // console.log("Starting Supabase upload...");
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return { success: false, error: error.message };
      }

      

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // console.log("Public URL generated:", publicData.publicUrl);
      // console.log("=== ImageService: uploadImage COMPLETED ===\n");

      return {
        success: true,
        url: publicData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of File objects
   * @param folder - Folder path
   * @returns Array of upload results
   */
  async uploadMultipleImages(files: File[], folder: string = "chef-menu"): Promise<UploadImageResult[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  /**
   * Delete image from Supabase Storage
   * @param imageUrl - Public URL of the image
   * @returns Success status
   */
  async deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createAdminClient();

      // Extract bucket and file path from public URL
      // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const match = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
      if (!match) {
        return { success: false, error: "Invalid image URL" };
      }

      const bucket = match[1];
      const filePath = match[2];

      if (!this.allowedBuckets.includes(bucket)) {
        return { success: false, error: "Invalid bucket" };
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error("Supabase delete error:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Image delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete image",
      };
    }
  }

  /**
   * Optimize image URL for display
   * @param url - Original image URL
   * @param width - Optional width for resizing
   * @param quality - Optional quality (0-100)
   * @returns Optimized URL
   */
  getOptimizedUrl(url: string, width?: number, quality: number = 80): string {
    if (!url) return "";

    // For Supabase images, you can add transform parameters
    // This is a basic example - adjust based on your Supabase configuration
    const params = new URLSearchParams();
    if (width) params.append("width", width.toString());
    params.append("quality", quality.toString());

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${params.toString()}`;
  }
}

export const imageService = new ImageService();
