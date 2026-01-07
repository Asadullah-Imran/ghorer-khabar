import { createClient } from "@/lib/supabase/server";

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class ImageService {
  private bucketName = "menu-image";

  /**
   * Upload image to Supabase Storage
   * @param file - File object from form
   * @param folder - Folder path (e.g., 'chef-menu', 'dishes')
   * @returns Upload result with public URL
   */
  async uploadImage(file: File, folder: string = "chef-menu"): Promise<UploadImageResult> {
    try {
      if (!file) {
        return { success: false, error: "No file provided" };
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: "Invalid file type. Only JPEG, PNG, WebP, and GIF allowed." };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return { success: false, error: "File size exceeds 5MB limit" };
      }

      const supabase = await createClient();

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split(".").pop() || "jpg";
      const fileName = `${timestamp}-${random}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicData.publicUrl,
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
      const supabase = await createClient();

      // Extract file path from public URL
      // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const urlParts = imageUrl.split("/");
      const bucketIndex = urlParts.indexOf(this.bucketName);
      if (bucketIndex === -1) {
        return { success: false, error: "Invalid image URL" };
      }

      const filePath = urlParts.slice(bucketIndex + 1).join("/");

      const { error } = await supabase.storage
        .from(this.bucketName)
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
