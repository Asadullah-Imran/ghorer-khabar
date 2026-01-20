import { prisma } from "@/lib/prisma/prisma";
import { sendSellerApprovalEmail, sendSellerRejectionEmail, sendSellerSuspensionEmail } from "@/lib/email/emailService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "10");
    const search = searchParams.get("search");

    const where: any = { seller: { role: "SELLER" } };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { seller: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [kitchens, total] = await Promise.all([
      prisma.kitchen.findMany({
        where,
        skip,
        take,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.kitchen.count({ where }),
    ]);

    return NextResponse.json({ kitchens, total });
  } catch (error) {
    console.error("Error fetching kitchens:", error);
    return NextResponse.json(
      { error: "Failed to fetch kitchens" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { kitchenId, isVerified, onboardingCompleted, isActive, action, reason } = body;

    if (!kitchenId) {
      return NextResponse.json({ error: "kitchenId is required" }, { status: 400 });
    }

    // Handle rejection - send email and delete kitchen data
    if (action === "reject" && reason) {
      const kitchen = await prisma.kitchen.findUnique({
        where: { id: kitchenId },
        include: { seller: true },
      });

      if (!kitchen) {
        return NextResponse.json({ error: "Kitchen not found" }, { status: 404 });
      }

      // Send rejection email before deletion
      if (kitchen.seller?.email) {
        sendSellerRejectionEmail(
          kitchen.seller.email,
          kitchen.seller.name || "Seller",
          kitchen.name,
          reason
        ).catch((err) => console.error("Failed to send seller rejection email:", err));
      }

      // Delete kitchen and all related data
      await prisma.kitchen.delete({
        where: { id: kitchenId },
      });

      return NextResponse.json({ success: true, deleted: true });
    }

    const data: any = {};
    if (typeof isVerified === "boolean") data.isVerified = isVerified;
    if (typeof onboardingCompleted === "boolean") data.onboardingCompleted = onboardingCompleted;
    if (typeof isActive === "boolean") data.isActive = isActive;

    const kitchen = await prisma.kitchen.update({
      where: { id: kitchenId },
      data,
      include: { seller: true },
    });

    // Fire-and-forget approval email when kitchen becomes verified and onboarding completed
    if (data.isVerified === true && data.onboardingCompleted === true && kitchen.seller?.email) {
      sendSellerApprovalEmail(
        kitchen.seller.email,
        kitchen.seller.name || "Seller",
        kitchen.name
      ).catch((err) => console.error("Failed to send seller approval email:", err));
    }

    // Fire-and-forget suspension email when action is "suspend"
    if (action === "suspend" && reason && kitchen.seller?.email) {
      sendSellerSuspensionEmail(
        kitchen.seller.email,
        kitchen.seller.name || "Seller",
        kitchen.name,
        reason
      ).catch((err) => console.error("Failed to send seller suspension email:", err));
    }

    return NextResponse.json(kitchen);
  } catch (error) {
    console.error("Error updating kitchen:", error);
    return NextResponse.json(
      { error: "Failed to update kitchen" },
      { status: 500 }
    );
  }
}
