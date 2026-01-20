import { prisma } from "@/lib/prisma/prisma";

export async function GET() {
  try {
    // Fetch all unique zones from addresses where kitchens exist
    const zones = await prisma.address.findMany({
      where: {
        zone: {
          not: null,
        },
        kitchen: {
          isNot: null,
        },
      },
      select: {
        zone: true,
      },
      distinct: ["zone"],
      orderBy: {
        zone: "asc",
      },
    });

    const uniqueZones = zones
      .map((z) => z.zone)
      .filter((zone) => zone !== null) as string[];

    return Response.json(
      {
        success: true,
        zones: uniqueZones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching zones:", error);
    return Response.json(
      { success: false, error: "Failed to fetch zones" },
      { status: 500 }
    );
  }
}
