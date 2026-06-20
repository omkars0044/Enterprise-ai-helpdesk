import { useAuth, type Role } from "@/lib/auth";
import { getTickets } from "@/lib/tickets";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3, PlusCircle, FolderOpen, Timer, Cog, Plug, Code2, Settings, LogOut, Shield, TrendingUp, Ticket,
} from "lucide-react";

const ALL_NAV = [
  { to: "/", label: "Dashboard", icon: BarChart3, roles: ["Admin", "Manager", "Agent", "Employee"] },
  { to: "/submit", label: "Submit Request", icon: PlusCircle, roles: ["Admin", "Manager", "Agent", "Employee"] },
  { to: "/operations", label: "Operations", icon: FolderOpen, badge: true, roles: ["Admin", "Manager", "Agent"] },
  { to: "/my-tickets", label: "My Tickets", icon: Ticket, roles: ["Employee"] },
  { to: "/sla", label: "SLA Tracker", icon: Timer, roles: ["Admin", "Manager", "Agent"] },
  { to: "/reports", label: "Reports", icon: TrendingUp, roles: ["Admin", "Manager"] },
  { to: "/automation", label: "Automation Engine", icon: Cog, roles: ["Admin"] },
  { to: "/integrations", label: "Integrations", icon: Plug, roles: ["Admin"] },
  
  { to: "/settings", label: "Settings", icon: Settings, roles: ["Admin"] },
];

const roleBadge: Record<string, string> = {
  Admin: "bg-corp-purple-light text-corp-purple",
  Employee: "bg-corp-green-light text-corp-green",
  Manager: "bg-corp-amber-light text-corp-amber",
  Agent: "bg-primary-light text-primary",
};

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const ticketCount = getTickets().length;
  const navItems = ALL_NAV.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-60 min-w-[240px] h-screen bg-card border-r flex flex-col fixed left-0 top-0 z-30">
      <div className="px-5 py-5 flex items-center gap-2 border-b">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground tracking-tight"><span className="text-lg font-bold text-foreground tracking-tight">HelpDesk</span></span>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors relative ${
                active
                  ? "bg-primary-light text-primary before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-primary before:rounded-r"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
              {item.badge && ticketCount > 0 && (
                <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                  {ticketCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>



    </aside>
  );
}
