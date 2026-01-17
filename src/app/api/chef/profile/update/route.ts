import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const kitchenId = formData.get("kitchenId") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const area = formData.get("area") as string;
    const coverImageFile = formData.get("coverImage") as File | null;
    const profileImageFile = formData.get("profileImage") as File | null;

    // Verify ownership
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
    });

    if (!kitchen || kitchen.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Kitchen not found or unauthorized" },
        { status: 403 }
      );
    }

    let coverImageUrl = kitchen.coverImage;
    let profileImageUrl = kitchen.profileImage;

    // Handle cover image upload
    if (coverImageFile) {
      try {
        const bytes = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `cover-${kitchenId}-${Date.now()}`;

        // Upload to Supabase Storage
        const { data: uploadedFile, error: uploadError } =
          await supabase.storage
            .from("kitchen-images")
            .upload(`covers/${fileName}`, buffer, {
              cacheControl: "3600",
              upsert: true,
            });

        if (uploadError) {
          console.error("Cover image upload error:", uploadError);
          throw new Error("Failed to upload cover image");
        }

        const { data: publicUrlData } = supabase.storage
          .from("kitchen-images")
          .getPublicUrl(`covers/${fileName}`);

        coverImageUrl = publicUrlData.publicUrl;
      } catch (imgError) {
        console.error("Cover image handling error:", imgError);
      }
    }

    // Handle profile image upload
    if (profileImageFile) {
      try {
        const bytes = await profileImageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `profile-${kitchenId}-${Date.now()}`;

        const { data: uploadedFile, error: uploadError } =
          await supabase.storage
            .from("kitchen-images")
            .upload(`profiles/${fileName}`, buffer, {
              cacheControl: "3600",
              upsert: true,
            });

        if (uploadError) {
          console.error("Profile image upload error:", uploadError);
          throw new Error("Failed to upload profile image");
        }

        const { data: publicUrlData } = supabase.storage
          .from("kitchen-images")
          .getPublicUrl(`profiles/${fileName}`);

        profileImageUrl = publicUrlData.publicUrl;
      } catch (imgError) {
        console.error("Profile image handling error:", imgError);
      }
    }

    // Update kitchen in database
    const updatedKitchen = await prisma.kitchen.update({
      where: { id: kitchenId },
      data: {
        name,
        type,
        description,
        location,
        area,
        coverImage: coverImageUrl,
        profileImage: profileImageUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      kitchen: updatedKitchen,
      coverImageUrl,
      profileImageUrl,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
