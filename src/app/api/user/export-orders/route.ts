import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (can be any role)
    const userId = await getAuthUserId();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get("buyerId") || userId;

    // Users can only export their own orders, admins can export any user's orders
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== "ADMIN" && userId !== buyerId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Verify buyer exists
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
    });

    if (!buyer) {
      return new NextResponse("Buyer not found", { status: 404 });
    }

    // Fetch all orders for this buyer with seller details
    const orders = await prisma.order.findMany({
      where: { userId: buyerId },
      include: {
        kitchen: {
          select: {
            name: true,
            location: true,
            sellerId: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get seller details for each kitchen
    const enrichedOrders = await Promise.all(
      orders.map(async (order: any) => {
        let sellerInfo: any = { name: "N/A", email: "N/A", phone: "N/A" };
        if (order.kitchen?.sellerId) {
          const seller = await prisma.user.findUnique({
            where: { id: order.kitchen.sellerId },
            select: { name: true, email: true, phone: true },
          });
          if (seller) sellerInfo = { name: seller.name || "N/A", email: seller.email || "N/A", phone: seller.phone || "N/A" };
        }
        return { ...order, sellerInfo };
      })
    );

    // Generate CSV
    const headers = [
      "Order ID",
      "Restaurant/Seller Name",
      "Chef Name",
      "Chef Email",
      "Chef Phone",
      "Items Count",
      "Total Quantity",
      "Order Amount",
      "Status",
      "Order Date",
      "Order Time",
      "Notes",
    ];

    let csv = headers.join(",") + "\n";

    enrichedOrders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const orderTime = new Date(order.createdAt).toLocaleTimeString();

      const totalQuantity = order.items?.reduce((sum: number, item: any) => {
        return sum + (item.quantity || 0);
      }, 0) || 0;

      csv += [
        `"${order.id}"`,
        `"${order.kitchen?.name || "N/A"}"`,
        `"${order.sellerInfo.name}"`,
        `"${order.sellerInfo.email}"`,
        `"${order.sellerInfo.phone}"`,
        order.items?.length || 0,
        totalQuantity,
        order.total || 0,
        `"${order.status}"`,
        `"${orderDate}"`,
        `"${orderTime}"`,
        `"${order.notes || ""}"`,
      ].join(",") + "\n";
    });

    // Add summary section
    csv += "\n\n### BUYER ORDER HISTORY ###\n";
    csv += `Buyer Name,"${buyer.name || "N/A"}"\n`;
    csv += `Buyer Email,"${buyer.email || "N/A"}"\n`;
    csv += `Buyer Phone,"${buyer.phone || "N/A"}"\n`;
    csv += `Total Orders,${orders.length}\n`;

    const totalSpent = orders
      .filter((o: any) => o.status === "COMPLETED")
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    csv += `Total Amount Spent (Completed),"${totalSpent.toFixed(2)}"\n`;

    const statusBreakdown: { [key: string]: number } = {};
    orders.forEach((order: any) => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });

    Object.entries(statusBreakdown).forEach(([status, count]) => {
      csv += `${status} Orders,${count}\n`;
    });

    // Favorite sellers
    const sellerCounts: { [key: string]: { name: string; count: number } } = {};
    enrichedOrders.forEach((order: any) => {
      if (order.kitchen) {
        if (!sellerCounts[order.kitchenId]) {
          sellerCounts[order.kitchenId] = {
            name: order.kitchen.name,
            count: 0,
          };
        }
        sellerCounts[order.kitchenId].count++;
      }
    });

    const topSellers = Object.entries(sellerCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    if (topSellers.length > 0) {
      csv += "\n### TOP SELLERS ###\n";
      topSellers.forEach(([, seller]) => {
        csv += `"${seller.name}",${seller.count} orders\n`;
      });
    }

    // Create blob and return
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const fileName = `my-orders-${buyer.name?.replace(/\s+/g, "-") || "export"}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(blob, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "text/csv;charset=utf-8;",
      },
    });
  } catch (error) {
    console.error("Export buyer orders error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
