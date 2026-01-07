/**
 * @swagger
 * /api/chef/subscriptions/{id}/status:
 *   patch:
 *     summary: Toggle plan active status
 *     tags: [Chef Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Plan not found
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
// import { getUserIdFromRequest, getChefKitchen } from "@/lib/auth/chef-auth";
import { toggleSubscriptionStatusSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const TEMP_KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "temp-kitchen-1";
    const { id } = await params;
    const body = await req.json();
    const validated = toggleSubscriptionStatusSchema.parse(body);

    const existingPlan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.kitchen_id !== TEMP_KITCHEN_ID) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.subscription_plans.update({
      where: { id },
      data: { is_active: validated.isActive },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        isActive: updated.is_active,
      },
    });
  } catch (error) {
    console.error("PATCH /api/chef/subscriptions/[id]/status:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    );
  }
}
