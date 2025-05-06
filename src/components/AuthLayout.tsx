
import { ReactNode, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/ui/loading-state";

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src="/icon.png" alt="Infinity Classes" className="h-16 w-16 object-contain mb-4" />
        <LoadingState text="Loading your account..." size="sm" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the current path to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
