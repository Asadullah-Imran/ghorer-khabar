import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return new NextResponse("Seller ID is required", { status: 400 });
    }

    // Verify seller exists
    const seller = await prisma.kitchen.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return new NextResponse("Seller not found", { status: 404 });
    }

    // Get seller user info
    const sellerUser = await prisma.user.findUnique({
      where: { id: seller.sellerId },
    });

    // Fetch all orders for this seller with buyer details
    const orders = await prisma.order.findMany({
      where: { kitchenId: sellerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "Order ID",
      "Buyer Name",
      "Buyer Email",
      "Buyer Phone",
      "Order Date",
      "Order Time",
      "Status",
      "Items Count",
      "Total Amount",
      "Notes",
    ];

    let csv = headers.join(",") + "\n";

    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const orderTime = new Date(order.createdAt).toLocaleTimeString();

      csv += [
        `"${order.id}"`,
        `"${order.user?.name || "N/A"}"`,
        `"${order.user?.email || "N/A"}"`,
        `"${order.user?.phone || "N/A"}"`,
        `"${orderDate}"`,
        `"${orderTime}"`,
        `"${order.status}"`,
        order.items?.length || 0,
        order.total || 0,
        `"${order.notes || ""}"`,
      ].join(",") + "\n";
    });

    // Add summary section
    csv += "\n\n### SELLER ORDER SUMMARY ###\n";
    csv += `Seller Name,"${sellerUser?.name || "N/A"}"\n`;
    csv += `Seller Email,"${sellerUser?.email || "N/A"}"\n`;
    csv += `Kitchen Name,"${seller.name || "N/A"}"\n`;
    csv += `Total Orders,${orders.length}\n`;

    const totalRevenue = orders
      .filter((o: any) => o.status === "COMPLETED")
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    csv += `Total Revenue (Completed),"${totalRevenue.toFixed(2)}"\n`;

    const statusBreakdown: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });

    Object.entries(statusBreakdown).forEach(([status, count]) => {
      csv += `${status} Orders,${count}\n`;
    });

    // Create blob and return
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const fileName = `seller-orders-${sellerUser?.name?.replace(/\s+/g, "-") || "export"}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(blob, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "text/csv;charset=utf-8;",
      },
    });
  } catch (error) {
    console.error("Export seller orders error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
