import ChefGuard from "@/components/auth/ChefGuard";
import ChefNavbar from "@/components/chef/Navigation/Navbar";
import ChefSidebar from "@/components/chef/Navigation/Sidebar";

export default function ChefLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChefGuard>
      <ChefNavbar kitchenName="Chef's Kitchen" />
      <div className="flex">
        <ChefSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] overflow-auto">
          {children}
        </main>
      </div>
    </ChefGuard>
  );
}
