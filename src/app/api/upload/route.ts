import { imageService } from "@/services/image.service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const ALLOWED_BUCKETS = ["nid-documents", "kitchen-images", "avatars", "menu-image", "subscription-plan-images"];

export async function POST(request: NextRequest) {
  try {
    console.log("\n=== BACKEND: POST /api/upload STARTED ===");
    
    let userId: string | undefined;

    // 1. Try Supabase Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (user && !authError) {
      userId = user.id;
      console.log("Authenticated via Supabase. User ID:", userId);
    } else {
      // 2. Try JWT Cookie Auth (Fallback)
      console.log("Supabase auth not found, checking JWT cookie...");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;

      if (token) {
        const decoded = verifyToken(token);
        // Ensure decoded is an object and has userId
        if (decoded && typeof decoded === "object" && "userId" in decoded) {
          userId = (decoded as any).userId;
          console.log("Authenticated via JWT Cookie. User ID:", userId);
        } else {
           console.log("Invalid JWT token structure");
        }
      }
    }

    if (!userId) {
      console.log("Auth error - user not authenticated via Supabase or JWT");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;

    console.log("Upload request:", { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type,
      bucket,
      userId 
    });

    // Validation
    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      console.log("Invalid bucket:", bucket);
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    // Upload via shared image service (handles type/size validation and URL generation)
    console.log("Uploading to bucket:", bucket, "for user:", userId);
    const uploadResult = await imageService.uploadImage(file, userId, bucket);

    if (!uploadResult.success || !uploadResult.url) {
      console.error("Upload failed:", uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error || "Failed to upload file" },
        { status: 500 }
      );
    }

    console.log("Upload successful:", uploadResult.url);
    console.log("=== BACKEND: POST /api/upload COMPLETED ===\n");

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      path: uploadResult.path,
    });
  } catch (error) {
    console.error("=== BACKEND: POST /api/upload ERROR ===", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
