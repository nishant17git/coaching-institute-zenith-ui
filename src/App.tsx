
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AuthLayout } from "@/components/AuthLayout";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";

// Pages
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import StudentAttendanceDetails from "./pages/StudentAttendanceDetails";
import Fees from "./pages/Fees";
import Attendance from "./pages/Attendance";
import TestRecord from "./pages/TestRecord";
import TestHistory from "./pages/TestHistory";
import Questions from "./pages/Questions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import More from "./pages/More";
import NotFound from "./pages/NotFound";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import InstituteSettings from "@/pages/settings/InstituteSettings";
import NotificationSettings from "@/pages/settings/NotificationSettings";
import AppearanceSettings from "@/pages/settings/AppearanceSettings";
import PrivacySecuritySettings from "@/pages/settings/PrivacySecuritySettings";
import DataStorageSettings from "@/pages/settings/DataStorageSettings";
import HelpSupportSettings from "@/pages/settings/HelpSupportSettings";
import AboutSettings from "@/pages/settings/AboutSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Wrapper component to handle scroll-to-top for non-layout pages
function ScrollWrapper({ children }: { children: React.ReactNode }) {
  useScrollToTop();
  return <>{children}</>;
}

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={
                <ScrollWrapper>
                  <Login />
                </ScrollWrapper>
              } />
              <Route path="/reset-password" element={
                <ScrollWrapper>
                  <ResetPassword />
                </ScrollWrapper>
              } />
              
              <Route element={<AuthLayout><AppLayout /></AuthLayout>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<StudentDetail />} />
                <Route path="/students/:id/attendance" element={<StudentAttendanceDetails />} />
                <Route path="/fees" element={<Fees />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/tests" element={<TestRecord />} />
                <Route path="/tests/history/:studentId" element={<TestHistory />} />
                <Route path="/questions/*" element={<Questions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings/profile" element={<AuthLayout><ProfileSettings /></AuthLayout>} />
                <Route path="/settings/institute" element={<AuthLayout><InstituteSettings /></AuthLayout>} />
                <Route path="/settings/notifications" element={<AuthLayout><NotificationSettings /></AuthLayout>} />
                <Route path="/settings/appearance" element={<AuthLayout><AppearanceSettings /></AuthLayout>} />
                <Route path="/settings/security" element={<AuthLayout><PrivacySecuritySettings /></AuthLayout>} />
                <Route path="/settings/data" element={<AuthLayout><DataStorageSettings /></AuthLayout>} />
                <Route path="/settings/help" element={<AuthLayout><HelpSupportSettings /></AuthLayout>} />
                <Route path="/settings/about" element={<AuthLayout><AboutSettings /></AuthLayout>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/more" element={<More />} />
              </Route>
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={
                <ScrollWrapper>
                  <NotFound />
                </ScrollWrapper>
              } />
            </Routes>
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
