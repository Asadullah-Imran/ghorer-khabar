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
            addresses: {
              where: { isDefault: true },
              select: {
                address: true,
                zone: true,
              },
            },
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "Order Number",
      "Order ID",
      "Buyer Name",
      "Buyer Email",
      "Buyer Phone",
      "Buyer Location",
      "Buyer Zone",
      "Order Date",
      "Order Time",
      "Status",
      "Items Sold",
      "Items Count",
      "Total Quantity",
      "Total Amount",
      "Notes",
    ];

    let csv = headers.join(",") + "\n";

    orders.forEach((order: any, index: number) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const orderTime = new Date(order.createdAt).toLocaleTimeString();

      // Calculate total quantity
      const totalQuantity = order.items?.reduce((sum: number, item: any) => {
        return sum + (item.quantity || 0);
      }, 0) || 0;

      // Generate items sold details
      const itemsSold = order.items?.map((item: any) => {
        return `${item.menuItem?.name || "Item"} (x${item.quantity})`;
      }).join("; ") || "N/A";

      // Get buyer location
      const buyerAddress = order.user?.addresses?.[0]?.address || "N/A";
      const buyerZone = order.user?.addresses?.[0]?.zone || "N/A";

      csv += [
        index + 1,
        `"${order.id}"`,
        `"${order.user?.name || "N/A"}"`,
        `"${order.user?.email || "N/A"}"`,
        `"${order.user?.phone || "N/A"}"`,
        `"${buyerAddress}"`,
        `"${buyerZone}"`,
        `"${orderDate}"`,
        `"${orderTime}"`,
        `"${order.status}"`,
        `"${itemsSold}"`,
        order.items?.length || 0,
        totalQuantity,
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
