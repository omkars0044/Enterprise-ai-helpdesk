import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getTickets, updateTicketStatus, CATEGORIES, SLA_TIMES, STATUS_WEBHOOK, API_KEY, type Ticket } from "@/lib/tickets";
import { exportTicketsCSV } from "@/lib/tickets";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Download, Search, Inbox, X } from "lucide-react";

const FILTERS = ["all", "hr", "it", "admin", "access"] as const;
const PRIORITY_FILTERS = ["ALL", "HIGH", "MEDIUM", "LOW"] as const;

function getTags(t: Ticket): { label: string; className: string }[] {
  const tags: { label: string; className: string }[] = [];
  if (t.priority === "HIGH") tags.push({ label: "🔴 Urgent", className: "bg-corp-red-light text-corp-red" });
  if (t.priority === "MEDIUM") tags.push({ label: "⏳ Pending", className: "bg-corp-amber-light text-corp-amber" });
  if (t.status === "escalated" && t.priority !== "HIGH") tags.push({ label: "↑ SLA Risk", className: "bg-corp-red-light text-corp-red" });
  if (t.query_type === "access") tags.push({ label: "🔐 Security", className: "bg-corp-purple-light text-corp-purple" });
  if (!tags.length) tags.push({ label: "✓ Normal", className: "bg-corp-green-light text-corp-green" });
  return tags;
}

const statusColors: Record<string, string> = {
  escalated: "bg-corp-red-light text-corp-red",
  in_progress: "bg-corp-amber-light text-corp-amber",
  resolved: "bg-corp-green-light text-corp-green",
  new: "bg-primary-light text-primary",
};

const catColors: Record<string, string> = {
  hr: "bg-corp-purple-light text-corp-purple",
  it: "bg-primary-light text-primary",
  admin: "bg-corp-teal-light text-corp-teal",
  access: "bg-corp-amber-light text-corp-amber",
};

const prioColors: Record<string, string> = {
  HIGH: "bg-corp-red-light text-corp-red",
  MEDIUM: "bg-corp-amber-light text-corp-amber",
  LOW: "bg-corp-green-light text-corp-green",
};

const ALL_STATUSES: Ticket["status"][] = ["new", "in_progress", "resolved", "escalated"];
const AGENT_STATUSES: Ticket["status"][] = ["in_progress", "resolved"];

export default function OperationsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Read dept and search filters from URL on mount
  useEffect(() => {
    const dept = searchParams.get("dept");
    if (dept && FILTERS.includes(dept as any)) {
      setFilter(dept);
    }
    const s = searchParams.get("search");
    if (s) {
      setSearch(s);
      // Clean the search param from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams, { replace: true });
    }
  }, []);

  const priorityFilter = searchParams.get("priority") || "ALL";

  const setPriorityFilter = (p: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (p === "ALL") {
      newParams.delete("priority");
    } else {
      newParams.set("priority", p);
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (f: string) => {
    setFilter(f);
    const newParams = new URLSearchParams(searchParams);
    if (f === "all") {
      newParams.delete("dept");
    } else {
      newParams.set("dept", f);
    }
    setSearchParams(newParams);
  };

  const clearDeptFilter = () => {
    handleFilterChange("all");
  };

  const tickets = useMemo(() => {
    const all = getTickets();
    if (user?.role === "Agent") return all.filter(t => t.assigned_to === user.username || t.assigned_to === user.email);
    if (user?.role === "Employee") return all.filter(t => t.email === user.email);
    return all; // Admin, Manager
  }, [user, refreshKey]);

  const filtered = useMemo(() => {
    let t = tickets;
    if (filter !== "all") t = t.filter(x => x.query_type === filter);
    if (priorityFilter !== "ALL") t = t.filter(x => x.priority === priorityFilter);
    if (search) {
      const s = search.toLowerCase();
      t = t.filter(x => x.name.toLowerCase().includes(s) || x.ticket_id.toLowerCase().includes(s) || x.message.toLowerCase().includes(s) || x.email.toLowerCase().includes(s));
    }
    return t;
  }, [tickets, filter, priorityFilter, search]);

  const canChangeStatus = user?.role === "Admin" || user?.role === "Manager" || user?.role === "Agent";
  const canExport = user?.role === "Admin" || user?.role === "Manager";
  const allowedStatuses = user?.role === "Agent" ? AGENT_STATUSES : ALL_STATUSES;

  const handleStatusChange = async (ticket: Ticket, newStatus: Ticket["status"]) => {
    if (newStatus === ticket.status) return;
    const oldStatus = ticket.status;

    updateTicketStatus(ticket.ticket_id, newStatus);

    const statusMessage =
      newStatus === "resolved" ? "Your ticket has been successfully resolved. Thank you for your patience." :
      newStatus === "escalated" ? "Your issue has been escalated to senior management. You will be contacted within 1-2 hours." :
      newStatus === "in_progress" ? "Our team is actively working on your request. You will receive an update soon." :
      "Your ticket status has been updated.";

    try {
      await fetch(STATUS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({
          ticket_id: ticket.ticket_id,
          name: ticket.name,
          email: ticket.email,
          admin_email: user?.email,
          query_type: ticket.query_type,
          department: ticket.department,
          old_status: oldStatus,
          new_status: newStatus,
          updated_by: user?.displayName,
          updated_by_role: user?.role,
          api_key: API_KEY,
          message: statusMessage,
          original_message: ticket.message,
        }),
      });
      toast.success("✅ Status updated & email sent to employee!");
    } catch {
      toast.warning("⚠️ Status updated (email notification failed)");
    }

    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">All Tickets</h3>
          <span className="text-label-badge bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        {canExport && (
          <button onClick={exportTicketsCSV} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Department filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => handleFilterChange(f)}
            className={`text-label-badge font-medium px-3 py-1.5 rounded-full transition ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-border"}`}>
            {f === "all" ? "All" : CATEGORIES[f]}
          </button>
        ))}
      </div>

      {/* Priority filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-label-badge font-medium text-muted-foreground mr-1">Priority:</span>
        {PRIORITY_FILTERS.map(p => {
          const chipColors: Record<string, string> = {
            ALL: priorityFilter === "ALL" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-border",
            HIGH: priorityFilter === "HIGH" ? "bg-corp-red text-white" : "bg-muted text-muted-foreground hover:bg-border",
            MEDIUM: priorityFilter === "MEDIUM" ? "bg-corp-amber text-white" : "bg-muted text-muted-foreground hover:bg-border",
            LOW: priorityFilter === "LOW" ? "bg-corp-green text-white" : "bg-muted text-muted-foreground hover:bg-border",
          };
          const emoji: Record<string, string> = { ALL: "", HIGH: "🔴 ", MEDIUM: "🟡 ", LOW: "🟢 " };
          return (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={`text-label-badge font-medium px-3 py-1.5 rounded-full transition ${chipColors[p]}`}>
              {emoji[p]}{p === "ALL" ? "All" : p}
            </button>
          );
        })}
        {priorityFilter !== "ALL" && (
          <button onClick={() => setPriorityFilter("ALL")} className="flex items-center gap-1 text-label-badge text-corp-red hover:underline ml-1">
            <X className="h-3 w-3" /> Clear Filter
          </button>
        )}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..."
            className="h-8 pl-8 pr-3 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 w-56" />
        </div>
      </div>

      {/* Active filter indicators */}
      {(filter !== "all" || priorityFilter !== "ALL") && (
        <div className="flex items-center gap-3 bg-primary-light border border-primary/20 rounded-lg px-4 py-2 flex-wrap">
          {filter !== "all" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary font-medium">Showing: {CATEGORIES[filter]} tickets</span>
              <button onClick={clearDeptFilter} className="text-label-badge text-primary hover:underline flex items-center gap-1">
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          )}
          {filter !== "all" && priorityFilter !== "ALL" && <span className="text-muted-foreground">|</span>}
          {priorityFilter !== "ALL" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary font-medium">Filtered by: {priorityFilter} Priority</span>
              <button onClick={() => setPriorityFilter("ALL")} className="text-label-badge text-primary hover:underline flex items-center gap-1">
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-card border rounded-lg corp-shadow overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Inbox className="h-10 w-10 mb-3" />
            <p className="text-sm">No tickets found</p>
          </div>
        ) : (
          <table className="w-full text-table-cell">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Ticket ID", "Employee", "Dept", "Category", "Priority", "Tags", "Description", "Status", "SLA", "Time"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-label-badge font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.ticket_id} className="border-b last:border-0 hover:bg-primary-light/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary text-label-badge">{t.ticket_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground text-label-badge">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.employee_id}</p>
                  </td>
                  <td className="px-4 py-3 text-label-badge text-muted-foreground">{t.department}</td>
                  <td className="px-4 py-3"><span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${catColors[t.query_type] || ""}`}>{CATEGORIES[t.query_type]}</span></td>
                  <td className="px-4 py-3"><span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${prioColors[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">{getTags(t).map((tag, i) => <span key={i} className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${tag.className}`}>{tag.label}</span>)}</div>
                  </td>
                  <td className="px-4 py-3 text-label-badge text-muted-foreground max-w-[200px] truncate">{t.message}</td>
                  <td className="px-4 py-3">
                    {canChangeStatus ? (
                      <select
                        value={t.status}
                        onChange={e => handleStatusChange(t, e.target.value as Ticket["status"])}
                        className={`text-label-badge font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${statusColors[t.status] || ""}`}
                      >
                        {allowedStatuses.map(s => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${statusColors[t.status] || ""}`}>{t.status.replace("_", " ")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-label-badge text-muted-foreground">{SLA_TIMES[t.query_type] || "—"}</td>
                  <td className="px-4 py-3 text-label-badge text-muted-foreground whitespace-nowrap">{new Date(t.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
