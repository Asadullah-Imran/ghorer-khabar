import { verifyToken } from "@/lib/auth/jwt";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_API_KEY = process.env.ML_API_KEY || "ml-service-secret-key-ghorer-khabar-2026";

async function getAuthenticatedChefId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  let userId = user?.id;

  if (!userId && error) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "userId" in decoded) {
        userId = (decoded as any).userId as string;
      }
    }
  }

  return userId;
}

/**
 * GET /api/chef/analytics/ai-insights
 * Fetch AI-powered insights from ML service
 */
export async function GET(req: NextRequest) {
  try {
    const chefId = await getAuthenticatedChefId();
    
    if (!chefId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = searchParams.get("days") || "30";

    // Call ML service for AI insights
    const mlResponse = await fetch(
      `${ML_SERVICE_URL}/api/v1/kitchen-insights/${chefId}?days=${days}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": ML_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error("ML Service error:", errorText);
      
      // Return fallback data if ML service fails
      return NextResponse.json({
        chef_id: chefId,
        period_days: parseInt(days),
        review_insights: {
          summary: {
            total_reviews: 0,
            positive_count: 0,
            negative_count: 0,
            neutral_count: 0,
            avg_rating: 0
          },
          positive_themes: [
            { theme: "Great Quality", count: 0, keywords: [] },
            { theme: "Fresh", count: 0, keywords: [] },
            { theme: "Tasty", count: 0, keywords: [] },
          ],
          improvement_areas: []
        },
        kitchen_insights: [
          {
            type: "getting_started",
            priority: "medium",
            title: "Getting Started",
            description: "Start receiving orders and reviews to see AI-powered insights here.",
            metric: {}
          }
        ]
      });
    }

    const data = await mlResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI insights" },
      { status: 500 }
    );
  }
}
