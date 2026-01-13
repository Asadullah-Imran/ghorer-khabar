import Navbar from "@/components/navigation/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import type { Metadata } from "next";

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
  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </AuthGuard>
  );
}
