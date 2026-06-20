import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, CheckCircle2, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getTickets, CATEGORIES, type Ticket } from "@/lib/tickets";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/submit": "Submit Request",
  "/operations": "Operations Dashboard",
  "/sla": "SLA Tracker",
  "/reports": "Reports",
  "/automation": "Automation Engine",
  "/integrations": "Integrations",
  "/developer": "Developer Access",
  "/settings": "Settings",
  "/my-tickets": "My Tickets",
};

const roleBgMap: Record<string, string> = {
  Admin: "bg-corp-purple text-white",
  Manager: "bg-corp-amber text-white",
  Agent: "bg-primary text-primary-foreground",
  Employee: "bg-corp-green text-white",
};

const roleAvatarBg: Record<string, string> = {
  Admin: "bg-corp-purple-light text-corp-purple",
  Manager: "bg-corp-amber-light text-corp-amber",
  Agent: "bg-primary-light text-primary",
  Employee: "bg-corp-green-light text-corp-green",
};

const roleBadgeColors: Record<string, string> = {
  Admin: "bg-corp-purple-light text-corp-purple",
  Manager: "bg-corp-amber-light text-corp-amber",
  Agent: "bg-primary-light text-primary",
  Employee: "bg-corp-green-light text-corp-green",
};

const statusColors: Record<string, string> = {
  escalated: "text-corp-red",
  in_progress: "text-corp-amber",
  resolved: "text-corp-green",
  new: "text-primary",
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return getTickets()
      .filter(t =>
        t.ticket_id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery]);

  const handleResultClick = (ticket: Ticket) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(`/operations?search=${encodeURIComponent(ticket.ticket_id)}`);
  };

  return (
    <header className="h-14 border-b bg-card flex items-center px-6 gap-4 sticky top-0 z-20">
      <h2 className="text-base font-semibold text-foreground">{TITLES[location.pathname] || "HelpDesk"}</h2>
      <div className="flex-1 max-w-xs mx-auto relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search tickets..."
          className="w-full h-8 pl-9 pr-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
        {searchOpen && searchQuery.trim() && (
          <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">No tickets found</div>
            ) : (
              searchResults.map(t => (
                <button
                  key={t.ticket_id}
                  onClick={() => handleResultClick(t)}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary">{t.ticket_id}</span>
                      <span className={`text-[10px] font-semibold ${statusColors[t.status] || ""}`}>{t.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-sm text-foreground truncate">{t.name} — {t.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{CATEGORIES[t.query_type]}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <span className="flex items-center gap-1.5 text-label-badge font-medium text-corp-green bg-corp-green-light px-2.5 py-1 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5" /> All Systems Operational
        </span>
        <button
          onClick={() => navigate("/submit")}
          className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition"
        >
          <Plus className="h-4 w-4" /> New Request
        </button>

        {/* Profile dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${roleAvatarBg[user.role] || "bg-muted text-muted-foreground"}`}>
                {user.displayName[0]}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-tight">{user.displayName}</span>
                <span className={`text-label-badge font-semibold px-1.5 py-0.5 rounded ${roleBadgeColors[user.role] || ""}`}>
                  {user.role}
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border rounded-lg corp-shadow-md z-50 overflow-hidden animate-fade-in">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-base font-semibold ${roleAvatarBg[user.role]}`}>
                      {user.displayName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.displayName}</p>
                      <p className="text-label-badge text-muted-foreground">{user.email}</p>
                      <span className={`inline-block text-label-badge font-semibold px-1.5 py-0.5 rounded mt-1 ${roleBadgeColors[user.role]}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition">
                    <User className="h-4 w-4 text-muted-foreground" /> Profile
                  </button>
                  <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-corp-red hover:bg-corp-red-light rounded-md transition">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
