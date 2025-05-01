
import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-b from-background to-secondary/5 overflow-x-hidden">
      {!isMobile && <Sidebar />}
      <main className="flex-1 flex flex-col pb-[100px] md:pb-0 md:pl-[280px] transition-all duration-500 animate-fade-in w-full max-w-full">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden w-full max-w-full">
          <Outlet />
        </div>
        {isMobile && <BottomNavigation />}
      </main>
    </div>
  );
}
