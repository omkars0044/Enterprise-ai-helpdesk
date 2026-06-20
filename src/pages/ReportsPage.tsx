import { useMemo } from "react";
import { getTickets, exportReportCSV, CATEGORIES, SLA_TIMES } from "@/lib/tickets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function ReportsPage() {
  const tickets = useMemo(() => getTickets(), []);

  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    const breached = tickets.filter(t => t.status === "escalated").length;
    const pending = tickets.filter(t => t.status !== "resolved").length;
    return { total, resolved, breached, pending };
  }, [tickets]);

  const deptData = useMemo(() => {
    const depts: Record<string, { total: number; resolved: number; pending: number; breached: number }> = {};
    Object.keys(CATEGORIES).forEach(k => { depts[k] = { total: 0, resolved: 0, pending: 0, breached: 0 }; });
    tickets.forEach(t => {
      const d = depts[t.query_type];
      if (!d) return;
      d.total++;
      if (t.status === "resolved") d.resolved++;
      else d.pending++;
      if (t.status === "escalated") d.breached++;
    });
    return Object.entries(depts).map(([k, v]) => ({
      key: k, name: CATEGORIES[k], ...v, rate: v.total > 0 ? Math.round((v.resolved / v.total) * 100) : 0,
    }));
  }, [tickets]);

  const priorityCounts = useMemo(() => ({
    HIGH: tickets.filter(t => t.priority === "HIGH").length,
    MEDIUM: tickets.filter(t => t.priority === "MEDIUM").length,
    LOW: tickets.filter(t => t.priority === "LOW").length,
  }), [tickets]);

  const weeklyData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().split("T")[0]] = 0;
    }
    tickets.forEach(t => {
      const day = t.timestamp.split("T")[0];
      if (day in days) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      count,
    }));
  }, [tickets]);

  const slaData = [
    { dept: "HR", sla: "48 hrs", compliance: 85, status: "On Track" },
    { dept: "IT", sla: "6 hrs", compliance: 78, status: "On Track" },
    { dept: "Admin", sla: "24 hrs", compliance: 90, status: "On Track" },
    { dept: "Access", sla: "8 hrs", compliance: 65, status: "Monitoring" },
  ];

  const slaStatusColor: Record<string, string> = {
    "On Track": "bg-corp-green-light text-corp-green",
    "At Risk": "bg-corp-red-light text-corp-red",
    "Monitoring": "bg-corp-amber-light text-corp-amber",
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={stats.total} icon={FileText} color="text-primary" bg="bg-primary-light" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="text-corp-green" bg="bg-corp-green-light" />
        <StatCard label="SLA Breached" value={stats.breached} icon={AlertTriangle} color="text-corp-red" bg="bg-corp-red-light" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-corp-amber" bg="bg-corp-amber-light" />
      </div>

      {/* Department Performance */}
      <div className="bg-card border rounded-lg p-6 corp-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">Department Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-table-cell">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Department", "Total", "Resolved", "Pending", "SLA Breached", "Rate %"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-label-badge font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptData.map(d => (
                <tr key={d.key} className="border-b last:border-0">
                  <td className="px-4 py-3 text-table-cell font-medium text-foreground">{d.name}</td>
                  <td className="px-4 py-3 text-table-cell text-muted-foreground">{d.total}</td>
                  <td className="px-4 py-3 text-table-cell text-corp-green font-medium">{d.resolved}</td>
                  <td className="px-4 py-3 text-table-cell text-corp-amber font-medium">{d.pending}</td>
                  <td className="px-4 py-3 text-table-cell text-corp-red font-medium">{d.breached}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${d.rate}%` }} />
                      </div>
                      <span className="text-table-cell font-medium text-foreground">{d.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-corp-red-light border border-corp-red/20 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-corp-red">{priorityCounts.HIGH}</p>
          <p className="text-label-badge text-corp-red font-medium mt-1">HIGH Priority</p>
        </div>
        <div className="bg-corp-amber-light border border-corp-amber/20 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-corp-amber">{priorityCounts.MEDIUM}</p>
          <p className="text-label-badge text-corp-amber font-medium mt-1">MEDIUM Priority</p>
        </div>
        <div className="bg-corp-green-light border border-corp-green/20 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-corp-green">{priorityCounts.LOW}</p>
          <p className="text-label-badge text-corp-green font-medium mt-1">LOW Priority</p>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-card border rounded-lg p-6 corp-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent 7 Days Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="bg-card border rounded-lg p-6 corp-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">SLA Compliance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-table-cell">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Department", "SLA Time", "Compliance %", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-label-badge font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slaData.map(s => (
                <tr key={s.dept} className="border-b last:border-0">
                  <td className="px-4 py-3 text-table-cell font-medium text-foreground">{s.dept}</td>
                  <td className="px-4 py-3 text-table-cell text-muted-foreground">{s.sla}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.compliance >= 80 ? "bg-corp-green" : s.compliance >= 60 ? "bg-corp-amber" : "bg-corp-red"}`} style={{ width: `${s.compliance}%` }} />
                      </div>
                      <span className="text-table-cell font-medium">{s.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${slaStatusColor[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button onClick={exportReportCSV} className="flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition">
          <Download className="h-4 w-4" /> 📥 Export Full Report CSV
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: any; color: string; bg: string }) {
  return (
    <div className="bg-card border rounded-lg p-5 corp-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-label-badge font-medium text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
