import { useMemo, useState } from "react";
import { getTickets, CATEGORIES, SLA_TIMES, type Ticket } from "@/lib/tickets";
import { useAuth } from "@/lib/auth";
import { Search, Inbox } from "lucide-react";

const statusColors: Record<string, string> = {
  escalated: "bg-corp-red-light text-corp-red",
  in_progress: "bg-corp-amber-light text-corp-amber",
  resolved: "bg-corp-green-light text-corp-green",
  new: "bg-primary-light text-primary",
};

const prioColors: Record<string, string> = {
  HIGH: "bg-corp-red-light text-corp-red",
  MEDIUM: "bg-corp-amber-light text-corp-amber",
  LOW: "bg-corp-green-light text-corp-green",
};

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const tickets = useMemo(() => {
    return getTickets().filter(t => t.email === user?.email);
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return tickets;
    const s = search.toLowerCase();
    return tickets.filter(t => t.ticket_id.toLowerCase().includes(s) || t.message.toLowerCase().includes(s) || t.query_type.toLowerCase().includes(s));
  }, [tickets, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">My Tickets</h3>
          <span className="text-label-badge bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search my tickets..."
            className="h-8 pl-8 pr-3 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 w-56" />
        </div>
      </div>

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
                {["Ticket ID", "Category", "Priority", "Description", "Status", "SLA", "Submitted"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-label-badge font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.ticket_id} className="border-b last:border-0 hover:bg-primary-light/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary text-label-badge">{t.ticket_id}</td>
                  <td className="px-4 py-3 text-label-badge">{CATEGORIES[t.query_type]}</td>
                  <td className="px-4 py-3"><span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${prioColors[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-4 py-3 text-label-badge text-muted-foreground max-w-[250px] truncate">{t.message}</td>
                  <td className="px-4 py-3"><span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span></td>
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
