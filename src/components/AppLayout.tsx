import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
export function AppLayout() {
  const isMobile = useIsMobile();

  // Add scroll to top functionality
  useScrollToTop();
  return <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gradient-to-b from-background to-secondary/5 overflow-x-hidden">
        {!isMobile && <AppSidebar />}
        <SidebarInset className="flex flex-col">
          {!isMobile}
          <main className="flex-1 flex flex-col pb-[100px] md:pb-0">
            <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden w-full max-w-full bg-white py-0">
              <Outlet />
            </div>
            {isMobile && <BottomNavigation />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>;
}