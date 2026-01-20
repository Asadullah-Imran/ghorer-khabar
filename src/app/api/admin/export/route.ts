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

    // Fetch dashboard data for export
    const [totalUsers, totalSellers, totalOrders, orders, kitchens] = await Promise.all([
      prisma.user.count({
        where: { role: "BUYER" },
      }),
      prisma.user.count({
        where: { role: "SELLER" },
      }),
      prisma.order.count(),
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.kitchen.findMany({
        select: {
          id: true,
          name: true,
          totalOrders: true,
          totalRevenue: true,
          rating: true,
        },
        orderBy: { totalRevenue: "desc" },
        take: 50,
      }),
    ]);

    // Calculate stats
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const orderStatusCounts = {
      PENDING: orders.filter((o: any) => o.status === "PENDING").length,
      CONFIRMED: orders.filter((o: any) => o.status === "CONFIRMED").length,
      PREPARING: orders.filter((o: any) => o.status === "PREPARING").length,
      DELIVERING: orders.filter((o: any) => o.status === "DELIVERING").length,
      COMPLETED: orders.filter((o: any) => o.status === "COMPLETED").length,
      CANCELLED: orders.filter((o: any) => o.status === "CANCELLED").length,
    };

    // Build CSV content
    const csvRows: string[] = [];

    // Header section
    csvRows.push("ADMIN DASHBOARD REPORT");
    csvRows.push(`Generated: ${new Date().toLocaleString()}`);
    csvRows.push("");

    // Summary Statistics
    csvRows.push("SUMMARY STATISTICS");
    csvRows.push("Metric,Value");
    csvRows.push(`Total Users,${totalUsers}`);
    csvRows.push(`Total Sellers,${totalSellers}`);
    csvRows.push(`Total Orders,${totalOrders}`);
    csvRows.push(`Total Revenue,৳ ${totalRevenue.toFixed(2)}`);
    csvRows.push(`Average Order Value,৳ ${(totalRevenue / Math.max(totalOrders, 1)).toFixed(2)}`);
    csvRows.push("");

    // Order Status Breakdown
    csvRows.push("ORDER STATUS BREAKDOWN");
    csvRows.push("Status,Count,Percentage");
    Object.entries(orderStatusCounts).forEach(([status, count]) => {
      const percentage = ((count / totalOrders) * 100).toFixed(2);
      csvRows.push(`${status},${count},${percentage}%`);
    });
    csvRows.push("");

    // Top Kitchens
    csvRows.push("TOP KITCHENS BY REVENUE");
    csvRows.push("Kitchen Name,Total Orders,Total Revenue,Average Rating");
    kitchens.forEach((kitchen: any) => {
      csvRows.push(
        `"${kitchen.name}",${kitchen.totalOrders},৳ ${kitchen.totalRevenue.toFixed(2)},${kitchen.rating.toFixed(1)} ★`
      );
    });
    csvRows.push("");

    // Recent Orders (last 20)
    csvRows.push("RECENT ORDERS");
    csvRows.push("Order ID,Amount,Status,Date");
    orders
      .slice(0, 20)
      .forEach((order: any) => {
        csvRows.push(
          `${order.id},৳ ${order.total.toFixed(2)},${order.status},${new Date(order.createdAt).toLocaleString()}`
        );
      });

    const csvContent = csvRows.join("\n");

    // Return as CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="admin-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
