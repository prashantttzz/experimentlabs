import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthGuard from "@/lib/AuthGuard";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthGuard>
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1">
        <div className="w-full h-full p-5 text-black">{children}</div>
      </main>
    </SidebarProvider>
    </AuthGuard>
  );
}
