import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getAuthUserId } from "@/lib/auth/getAuthUser";

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const userId = await getAuthUserId();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    // Get date range parameter
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "1month"; // 1week or 1month
    
    let dateFilter = {};
    const now = new Date();
    
    if (dateRange === "1week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: weekAgo, lte: now };
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: monthAgo, lte: now };
    }

    // Fetch comprehensive dashboard data for export
    const [
      totalUsers,
      totalSellers,
      activeSellers,
      totalOrders,
      totalRevenueData,
      pendingOnboarding,
      orderStatusBreakdown,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.kitchen.count({ where: { isVerified: true, onboardingCompleted: true } }),
      prisma.order.count({ where: { createdAt: dateFilter } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "COMPLETED", createdAt: dateFilter },
      }),
      prisma.kitchen.count({ where: { isVerified: false } }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
        where: { createdAt: dateFilter },
      }),
    ]);

    // Get top kitchens
    const kitchens = await prisma.kitchen.findMany({
      select: {
        id: true,
        name: true,
        rating: true,
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    // Calculate kitchen revenue
    const kitchensWithRevenue = await Promise.all(
      kitchens.map(async (kitchen) => {
        const [revenue, totalOrdersCount] = await Promise.all([
          prisma.order.aggregate({
            _sum: { total: true },
            where: {
              kitchenId: kitchen.id,
              status: "COMPLETED",
            },
          }),
          prisma.order.count({
            where: { kitchenId: kitchen.id },
          }),
        ]);

        return {
          ...kitchen,
          totalRevenue: revenue._sum?.total || 0,
          totalOrders: totalOrdersCount,
        };
      })
    );

    // Get top menu items
    const topMenuItems = await prisma.menu_items.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        rating: true,
        reviewCount: true,
        users: { select: { name: true } },
      },
      orderBy: { reviewCount: "desc" },
      take: 15,
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        kitchen: { select: { name: true } },
      },
    });

    // Calculate metrics
    const totalRevenue = totalRevenueData._sum.total || 0;
    const completedOrders =
      orderStatusBreakdown.find((item) => item.status === "COMPLETED")?._count || 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const avgKitchenRevenue = activeSellers > 0 ? totalRevenue / activeSellers : 0;
    const sellerGrowthValue = totalSellers > 0 ? (activeSellers / totalSellers) * 100 : 0;

    // Build professional CSV content
    const csvRows: string[] = [];

    // Report Header
    csvRows.push("");
    csvRows.push("╔════════════════════════════════════════════════════════════════════════════════╗");
    csvRows.push("║                     GHORER KHABAR PLATFORM                                     ║");
    csvRows.push("║                    COMPREHENSIVE DASHBOARD REPORT                             ║");
    csvRows.push("╚════════════════════════════════════════════════════════════════════════════════╝");
    csvRows.push("");
    csvRows.push(`Report Generated: ${new Date().toLocaleString()}`);
    csvRows.push(`Report Period: Last 30 days`);
    csvRows.push(`Prepared by: Admin Dashboard`);
    csvRows.push("");
    csvRows.push("═".repeat(80));
    csvRows.push("");

    // EXECUTIVE SUMMARY SECTION
    csvRows.push("📊 EXECUTIVE SUMMARY");
    csvRows.push("─".repeat(80));
    csvRows.push("Key Performance Indicators,Value");
    csvRows.push(`Total Platform Users,${totalUsers}`);
    csvRows.push(`Total Registered Sellers,${totalSellers}`);
    csvRows.push(`Active Sellers (Verified & Approved),${activeSellers}`);
    csvRows.push(`Seller Onboarding Rate,${activeSellers > 0 ? ((activeSellers / totalSellers) * 100).toFixed(2) : 0}%`);
    csvRows.push(`Pending Seller Approvals,${pendingOnboarding}`);
    csvRows.push(`Total Orders (All Time),${totalOrders}`);
    csvRows.push(`Completed Orders,${completedOrders}`);
    csvRows.push(`Order Completion Rate,${completionRate.toFixed(2)}%`);
    csvRows.push(`Total Revenue (৳),${totalRevenue.toLocaleString()}`);
    csvRows.push(`Average Order Value (৳),${avgOrderValue.toFixed(2)}`);
    csvRows.push(`Average Revenue per Kitchen (৳),${avgKitchenRevenue.toFixed(2)}`);
    csvRows.push("");

    // ORDER STATUS BREAKDOWN
    csvRows.push("📈 ORDER STATUS DISTRIBUTION");
    csvRows.push("─".repeat(80));
    csvRows.push("Status,Count,Percentage");
    const statusSummary = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      DELIVERING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    orderStatusBreakdown.forEach((item) => {
      const percentage = totalOrders > 0 ? ((item._count / totalOrders) * 100).toFixed(2) : 0;
      csvRows.push(`${item.status},${item._count},${percentage}%`);
      if (item.status in statusSummary) {
        statusSummary[item.status as keyof typeof statusSummary] = item._count;
      }
    });
    csvRows.push("");

    // TOP PERFORMING KITCHENS
    csvRows.push("🏆 TOP PERFORMING KITCHENS (By Revenue)");
    csvRows.push("─".repeat(80));
    csvRows.push("Rank,Kitchen Name,Total Revenue (৳),Total Orders,Avg Rating,Revenue Share");
    const sortedKitchens = kitchensWithRevenue.sort((a, b) => b.totalRevenue - a.totalRevenue);
    sortedKitchens.slice(0, 15).forEach((kitchen, index) => {
      const revenueShare =
        totalRevenue > 0 ? ((kitchen.totalRevenue / totalRevenue) * 100).toFixed(2) : 0;
      csvRows.push(
        `${index + 1},"${kitchen.name}",${kitchen.totalRevenue.toLocaleString()},${kitchen.totalOrders},${(kitchen.rating || 0).toFixed(1)},${revenueShare}%`
      );
    });
    csvRows.push("");

    // TOP MENU ITEMS
    csvRows.push("⭐ TOP SELLING MENU ITEMS");
    csvRows.push("─".repeat(80));
    csvRows.push("Rank,Menu Item,Chef,Price (৳),Rating,Review Count");
    topMenuItems.slice(0, 15).forEach((item, index) => {
      csvRows.push(
        `${index + 1},"${item.name}","${item.users.name}",${item.price},${(item.rating || 0).toFixed(1)},${item.reviewCount}`
      );
    });
    csvRows.push("");

    // RECENT TRANSACTIONS
    csvRows.push("💰 RECENT TRANSACTIONS (Last 30 Orders)");
    csvRows.push("─".repeat(80));
    csvRows.push("Order ID,Kitchen,Customer,Amount (৳),Status,Date,Time");
    recentOrders.slice(0, 30).forEach((order) => {
      const date = new Date(order.createdAt);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      csvRows.push(
        `"${order.id}","${order.kitchen.name}","${order.user.name}",${order.total},"${order.status}","${dateStr}","${timeStr}"`
      );
    });
    csvRows.push("");

    // FINANCIAL SUMMARY
    csvRows.push("💵 FINANCIAL SUMMARY");
    csvRows.push("─".repeat(80));
    csvRows.push("Financial Metric,Amount (৳)");
    csvRows.push(`Total Revenue (Completed Orders),${totalRevenue.toLocaleString()}`);
    csvRows.push(`Average Transaction Value,${avgOrderValue.toFixed(2)}`);
    csvRows.push(`Revenue per Active Seller,${avgKitchenRevenue.toFixed(2)}`);
    csvRows.push(`Highest Kitchen Revenue,${sortedKitchens[0]?.totalRevenue.toLocaleString() || 0}`);
    csvRows.push("");

    // GROWTH METRICS
    csvRows.push("📊 PLATFORM HEALTH INDICATORS");
    csvRows.push("─".repeat(80));
    csvRows.push("Metric,Value,Status");
    csvRows.push(
      `Active Seller Ratio,${sellerGrowthValue.toFixed(2)}%,${sellerGrowthValue > 70 ? "Excellent" : sellerGrowthValue > 50 ? "Good" : "Needs Attention"}`
    );
    csvRows.push(
      `Order Completion Rate,${completionRate.toFixed(2)}%,${completionRate > 90 ? "Excellent" : completionRate > 75 ? "Good" : "Needs Attention"}`
    );
    const avgOrdersPerSeller = activeSellers > 0 ? (totalOrders / activeSellers).toFixed(2) : "0";
    csvRows.push(`Average Orders per Seller,${avgOrdersPerSeller},${parseFloat(avgOrdersPerSeller) > 50 ? "Excellent" : parseFloat(avgOrdersPerSeller) > 20 ? "Good" : "Needs Attention"}`);
    csvRows.push("");

    // RECOMMENDATIONS
    csvRows.push("💡 SYSTEM RECOMMENDATIONS");
    csvRows.push("─".repeat(80));
    if (pendingOnboarding > 5) {
      csvRows.push("⚠️  High number of pending seller approvals - Consider reviewing onboarding queue");
    }
    if (completionRate < 80) {
      csvRows.push("⚠️  Order completion rate below target - Investigate order fulfillment issues");
    }
    if (sellerGrowthValue < 60) {
      csvRows.push("⚠️  Low active seller ratio - Increase seller onboarding efforts");
    }
    if (completionRate >= 90 && sellerGrowthValue > 70) {
      csvRows.push("✓ Platform performing excellently across all key metrics");
    }
    csvRows.push("");

    // Footer
    csvRows.push("═".repeat(80));
    csvRows.push("Report Information:");
    csvRows.push("• This report contains sensitive business information - Confidential");
    csvRows.push("• Data accurate as of report generation time");
    csvRows.push("• For questions or data verification, contact: admin@ghorerkhabar.com");
    csvRows.push("• Platform: Ghorer Khabar - Food Delivery Management System");
    csvRows.push("═".repeat(80));
    csvRows.push("");

    const csvContent = csvRows.join("\n");

    // Return as CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ghorer-khabar-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
