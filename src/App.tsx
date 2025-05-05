import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DataProvider } from "@/contexts/DataContext";
import { AuthLayout } from "@/components/AuthLayout";
import { AppLayout } from "@/components/AppLayout";
import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Students = React.lazy(() => import("./pages/Students"));
const StudentDetail = React.lazy(() => import("./pages/StudentDetail"));
const Fees = React.lazy(() => import("./pages/Fees"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const TestRecord = React.lazy(() => import("./pages/TestRecord"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Settings = React.lazy(() => import("./pages/Settings"));
const More = React.lazy(() => import("./pages/More"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  <Route element={<AuthLayout><AppLayout /></AuthLayout>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/:id" element={<StudentDetail />} />
                    <Route path="/fees" element={<Fees />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/tests" element={<TestRecord />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/more" element={<More />} />
                  </Route>
                  
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;