
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
import { ErrorState } from "@/components/ui/error-state";

// Improved error boundary for lazy loaded components
const PageErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setHasError(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  if (hasError) {
    return (
      <ErrorState 
        title="Something went wrong" 
        description="We couldn't load this page. Please try again."
        retry={() => {
          setHasError(false);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <React.ErrorBoundary fallback={null} onError={() => setHasError(true)}>
      {children}
    </React.ErrorBoundary>
  );
};

// Improved loading fallback component with shorter timeout
const PageLoadingFallback = () => (
  <LoadingState text="Loading page..." size="md" delay={100} />
);

// Lazy load pages with better error handling
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      suspense: false, // Disable suspense mode for queries
    },
  },
});

// Helper to wrap components with Suspense and ErrorBoundary
const SuspenseWrapper = ({ element }: { element: React.ReactNode }) => (
  <PageErrorBoundary>
    <React.Suspense fallback={<PageLoadingFallback />}>
      {element}
    </React.Suspense>
  </PageErrorBoundary>
);

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
                  element={<SuspenseWrapper element={<Login />} />} 
                />
                
                <Route element={<AuthLayout />}>
                  <Route element={<AppLayout />}>
                    <Route 
                      path="/dashboard" 
                      element={<SuspenseWrapper element={<Dashboard />} />} 
                    />
                    <Route 
                      path="/students" 
                      element={<SuspenseWrapper element={<Students />} />} 
                    />
                    <Route 
                      path="/students/:id" 
                      element={<SuspenseWrapper element={<StudentDetail />} />} 
                    />
                    <Route 
                      path="/fees" 
                      element={<SuspenseWrapper element={<Fees />} />} 
                    />
                    <Route 
                      path="/attendance" 
                      element={<SuspenseWrapper element={<Attendance />} />} 
                    />
                    <Route 
                      path="/tests" 
                      element={<SuspenseWrapper element={<TestRecord />} />} 
                    />
                    <Route 
                      path="/reports" 
                      element={<SuspenseWrapper element={<Reports />} />} 
                    />
                    <Route 
                      path="/settings" 
                      element={<SuspenseWrapper element={<Settings />} />} 
                    />
                    <Route 
                      path="/more" 
                      element={<SuspenseWrapper element={<More />} />} 
                    />
                  </Route>
                </Route>
                
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="*" 
                  element={<SuspenseWrapper element={<NotFound />} />} 
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
