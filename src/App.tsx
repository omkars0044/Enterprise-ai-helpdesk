import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, type Role } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import SubmitRequestPage from "@/pages/SubmitRequestPage";
import OperationsPage from "@/pages/OperationsPage";
import MyTicketsPage from "@/pages/MyTicketsPage";
import SLAPage from "@/pages/SLAPage";
import ReportsPage from "@/pages/ReportsPage";
import AutomationPage from "@/pages/AutomationPage";
import IntegrationsPage from "@/pages/IntegrationsPage";

import SettingsPage from "@/pages/SettingsPage";
import AccessDeniedPage from "@/pages/AccessDeniedPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ROUTE_ROLES: Record<string, Role[]> = {
  "/": ["Admin", "Manager", "Agent", "Employee"],
  "/submit": ["Admin", "Manager", "Agent", "Employee"],
  "/operations": ["Admin", "Manager", "Agent"],
  "/my-tickets": ["Employee"],
  "/sla": ["Admin", "Manager", "Agent"],
  "/reports": ["Admin", "Manager"],
  "/automation": ["Admin"],
  "/integrations": ["Admin"],
  
  "/settings": ["Admin"],
};

function RoleGuard({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <AccessDeniedPage />;
  return <>{children}</>;
}

function AuthGate() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/submit" element={<SubmitRequestPage />} />
        <Route path="/operations" element={<RoleGuard roles={ROUTE_ROLES["/operations"]}><OperationsPage /></RoleGuard>} />
        <Route path="/my-tickets" element={<RoleGuard roles={ROUTE_ROLES["/my-tickets"]}><MyTicketsPage /></RoleGuard>} />
        <Route path="/sla" element={<RoleGuard roles={ROUTE_ROLES["/sla"]}><SLAPage /></RoleGuard>} />
        <Route path="/reports" element={<RoleGuard roles={ROUTE_ROLES["/reports"]}><ReportsPage /></RoleGuard>} />
        <Route path="/automation" element={<RoleGuard roles={ROUTE_ROLES["/automation"]}><AutomationPage /></RoleGuard>} />
        <Route path="/integrations" element={<RoleGuard roles={ROUTE_ROLES["/integrations"]}><IntegrationsPage /></RoleGuard>} />
        
        <Route path="/settings" element={<RoleGuard roles={ROUTE_ROLES["/settings"]}><SettingsPage /></RoleGuard>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
