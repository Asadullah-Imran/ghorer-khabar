import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_API_KEY = process.env.ML_API_KEY || "ml-service-secret-key-ghorer-khabar-2026";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a seller/chef
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden: Chef access only" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const model = searchParams.get("model") || "moving_average";

    // Call ML service
    const mlResponse = await fetch(
      `${ML_SERVICE_URL}/api/v1/forecast/demand/${userId}?days=${days}&model=${model}`,
      {
        headers: {
          "X-API-Key": ML_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!mlResponse.ok) {
      console.error("ML Service error:", await mlResponse.text());
      return NextResponse.json(
        { error: "ML service error" },
        { status: mlResponse.status }
      );
    }

    const data = await mlResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Forecast API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
