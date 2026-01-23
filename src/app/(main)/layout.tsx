import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/navigation/Navbar";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ghorer Khabar - Homemade Goodness",
  description:
    "Connecting health-conscious students and professionals with verified home chefs for authentic, transparently prepared meals.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getAuthUserId();

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { kitchens: true },
    });

    if (user?.role === "SELLER") {
      const kitchen = user.kitchens[0]; // Assuming one kitchen per user for now
      if (!kitchen || !kitchen.onboardingCompleted) {
        // Not completed onboarding - redirect to onboarding
        redirect("/chef-onboarding");
      } else if (!kitchen.isVerified) {
        // Completed onboarding but not verified - allow browsing as buyer
        // Don't redirect, let them browse the main app
        // They can access buyer routes but chef routes are protected by ChefGuard
      }
      // If verified, they can access both buyer and chef routes
    }
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </AuthGuard>
  );
}
