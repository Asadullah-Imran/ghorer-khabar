import ChefNavbar from "@/components/chef/Navigation/Navbar";
import ChefSidebar from "@/components/chef/Navigation/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ghorer Khabar - Chef Dashboard",
  description:
    "Manage your home kitchen and connect with health-conscious customers.",
};

export default function ChefLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ChefNavbar kitchenName="Chef's Kitchen" />
      <div className="flex">
        <ChefSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
