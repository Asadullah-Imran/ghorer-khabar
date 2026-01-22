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
    const includeForecast = searchParams.get("includeForecast") !== "false";
    const daysAhead = parseInt(searchParams.get("daysAhead") || "7");

    // Call ML service with timeout and better error handling
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const mlResponse = await fetch(
        `${ML_SERVICE_URL}/api/v1/shopping-list/${userId}?include_forecast=${includeForecast}&days_ahead=${daysAhead}`,
        {
          headers: {
            "X-API-Key": ML_API_KEY,
            "Content-Type": "application/json"
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!mlResponse.ok) {
        console.error("ML Service error:", await mlResponse.text());
        return NextResponse.json(
          { error: "ML service error", status: mlResponse.status },
          { status: mlResponse.status }
        );
      }

      const data = await mlResponse.json();
      return NextResponse.json(data);

    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        console.error("ML Service timeout");
        return NextResponse.json(
          { error: "ML service timeout - please try again", service: "unavailable" },
          { status: 503 }
        );
      }
      
      // Connection refused or other network errors
      console.error("ML Service connection error:", fetchError.code || fetchError.message);
      return NextResponse.json(
        { 
          error: "ML service unavailable - service may not be running", 
          code: fetchError.code,
          message: "Please ensure the ML recommendation service is running at " + ML_SERVICE_URL
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Shopping list API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
