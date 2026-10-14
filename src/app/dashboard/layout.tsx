import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { MobileTopBar } from "@/components/dashboard/ProductSidebar";
import { MobileNavProvider } from "@/components/providers/MobileNavProvider";

// The app shell: the sidebar on the left, the page on the right. Every page
// under src/app/dashboard/ renders inside it.
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MobileNavProvider>
      <div className="flex h-screen bg-page">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileTopBar product="dashboard" />
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
