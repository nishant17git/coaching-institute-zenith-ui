
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DataProvider } from "@/contexts/DataContext";
import { AuthLayout } from "@/components/AuthLayout";
import { AppLayout } from "@/components/AppLayout";
import * as React from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { ThemeProvider } from "@/components/theme-provider";

// Lazy load pages with better error boundaries
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

// Improved loading fallback component with shorter timeout
const PageLoadingFallback = () => (
  <LoadingState text="Loading page..." size="md" />
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
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <Routes>
                <Route 
                  path="/login" 
                  element={
                    <React.Suspense fallback={<PageLoadingFallback />}>
                      <Login />
                    </React.Suspense>
                  } 
                />
                
                <Route element={<AuthLayout />}>
                  <Route element={<AppLayout />}>
                    <Route 
                      path="/dashboard" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <Dashboard />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/students" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <Students />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/students/:id" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <StudentDetail />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/fees" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <Fees />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/attendance" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <Attendance />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/tests" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <TestRecord />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/reports" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <Reports />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <Settings />
                        </React.Suspense>
                      } 
                    />
                    <Route 
                      path="/more" 
                      element={
                        <React.Suspense fallback={<PageLoadingFallback />}>
                          <More />
                        </React.Suspense>
                      } 
                    />
                  </Route>
                </Route>
                
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="*" 
                  element={
                    <React.Suspense fallback={<PageLoadingFallback />}>
                      <NotFound />
                    </React.Suspense>
                  } 
                />
              </Routes>
              <Toaster />
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
