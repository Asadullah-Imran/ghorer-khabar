import ChefGuard from "@/components/auth/ChefGuard";
import ChefNavbar from "@/components/chef/Navigation/Navbar";
import ChefSidebar from "@/components/chef/Navigation/Sidebar";
import Footer from "@/components/navigation/Footer";

export default function ChefLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChefGuard>
      <ChefNavbar />
      <div className="flex min-h-screen bg-gray-50">
        <ChefSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
      <Footer />
    </ChefGuard>
  );
}
