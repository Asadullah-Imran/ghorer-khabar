import { CartProvider } from "@/components/cart/CartProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConfirmationProvider } from "@/contexts/ConfirmationContext";
import { RoleTransitionProvider } from "@/contexts/RoleTransitionContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ghorer Khabar - Homemade Goodness",
  description:
    "Connecting health-conscious students and professionals with verified home chefs for authentic, transparently prepared meals.",
  icons: {
    icon: "/ghorer-khabar-logo.png",
    apple: "/ghorer-khabar-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} font-sans bg-background-light text-brand-dark`}
      >
        <AuthProvider>
          <ToastProvider>
            <ConfirmationProvider>
              <CartProvider>
                <RoleTransitionProvider>
                  <main className="min-h-screen">{children}</main>
                </RoleTransitionProvider>
              </CartProvider>
            </ConfirmationProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
