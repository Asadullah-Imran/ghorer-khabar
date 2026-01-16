import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/Navigation/Navbar";
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
        redirect("/chef-onboarding");
      }
    }
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </AuthGuard>
  );
}
