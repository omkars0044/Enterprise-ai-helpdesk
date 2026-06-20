import { useMemo } from "react";
import { getTickets, CATEGORIES, SLA_TIMES, DEPT_COLORS } from "@/lib/tickets";

// SLA target hours per department
const SLA_TARGET_HOURS: Record<string, number> = {
  hr: 48,
  it: 6,
  admin: 24,
  access: 8,
};

function getHoursSince(timestamp: string) {
  return (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
}

export default function SLAPage() {
  const tickets = useMemo(() => getTickets(), []);

  // Compute real SLA compliance per department
  const deptStats = useMemo(() => {
    return Object.keys(CATEGORIES).map((key) => {
      const deptTickets = tickets.filter((t) => t.query_type === key);
      const total = deptTickets.length;

      if (total === 0) {
        return { key, pct: 100, status: "On Track" as const, total: 0, resolved: 0, breached: 0, inProgress: 0, avgHours: 0 };
      }

      const targetHrs = SLA_TARGET_HOURS[key] || 24;
      let resolvedInTime = 0;
      let breached = 0;
      let totalHours = 0;

      deptTickets.forEach((t) => {
        const hrs = getHoursSince(t.timestamp);
        totalHours += Math.min(hrs, targetHrs * 2);

        if (t.status === "resolved") {
          // Consider resolved tickets as within SLA if they exist
          resolvedInTime++;
        } else if (hrs > targetHrs) {
          breached++;
        } else {
          resolvedInTime++;
        }
      });

      const pct = Math.round((resolvedInTime / total) * 100);
      const status = pct >= 85 ? "On Track" : pct >= 70 ? "Monitoring" : "Breach Risk";
      const resolved = deptTickets.filter((t) => t.status === "resolved").length;
      const inProgress = deptTickets.filter((t) => t.status !== "resolved").length;
      const avgHours = Math.round(totalHours / total * 10) / 10;

      return { key, pct, status, total, resolved, breached, inProgress, avgHours };
    });
  }, [tickets]);

  // Overall stats
  const overallStats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const high = tickets.filter((t) => t.priority === "HIGH").length;
    const escalated = tickets.filter((t) => t.status === "escalated").length;
    const avgCompliance = deptStats.length
      ? Math.round(deptStats.reduce((s, d) => s + d.pct, 0) / deptStats.length)
      : 100;
    return { total, resolved, high, escalated, avgCompliance };
  }, [tickets, deptStats]);

  const riskTickets = useMemo(() => {
    return tickets
      .filter((t) => t.status !== "resolved")
      .map((t) => {
        const targetHrs = SLA_TARGET_HOURS[t.query_type] || 24;
        const elapsed = getHoursSince(t.timestamp);
        const remaining = targetHrs - elapsed;
        return { ...t, elapsed, remaining, targetHrs };
      })
      .filter((t) => t.remaining < t.targetHrs * 0.5) // show tickets past 50% of SLA
      .sort((a, b) => a.remaining - b.remaining);
  }, [tickets]);

  const statusBadge: Record<string, string> = {
    "On Track": "bg-corp-green-light text-corp-green",
    "Breach Risk": "bg-corp-red-light text-corp-red",
    "Monitoring": "bg-corp-amber-light text-corp-amber",
  };

  return (
    <div className="space-y-6">
      {/* Overall KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Tickets", value: overallStats.total, color: "text-primary" },
          { label: "Resolved", value: overallStats.resolved, color: "text-corp-green" },
          { label: "High Priority", value: overallStats.high, color: "text-corp-red" },
          { label: "Escalated", value: overallStats.escalated, color: "text-corp-amber" },
          { label: "Avg Compliance", value: `${overallStats.avgCompliance}%`, color: "text-primary" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border rounded-lg p-4 corp-shadow text-center">
            <p className="text-label-badge text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Compliance */}
        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-5">Live SLA Compliance</h3>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tickets yet — submit requests to see live SLA tracking</p>
          ) : (
            <div className="space-y-4">
              {deptStats.map((d) => {
                const colors = DEPT_COLORS[d.key];
                if (!colors) return null;
                return (
                  <div key={d.key}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{CATEGORIES[d.key]}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${statusBadge[d.status]}`}>
                          {d.status}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{d.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${d.pct >= 85 ? "bg-corp-green" : d.pct >= 70 ? "bg-corp-amber" : "bg-corp-red"}`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-1.5 text-label-badge text-muted-foreground">
                      <span>{d.total} total</span>
                      <span>{d.resolved} resolved</span>
                      <span>{d.inProgress} open</span>
                      {d.breached > 0 && <span className="text-corp-red font-medium">{d.breached} breached</span>}
                      <span>~{d.avgHours}h avg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Policy */}
        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-5">SLA Policy Reference</h3>
          <div className="space-y-3">
            {Object.entries(CATEGORIES).map(([k, label]) => {
              const colors = DEPT_COLORS[k];
              if (!colors) return null;
              const deptData = deptStats.find((d) => d.key === k);
              return (
                <div key={k} className={`${colors.bg} border ${colors.border} rounded-md p-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-semibold ${colors.text}`}>{label}</p>
                      <p className="text-label-badge text-muted-foreground mt-0.5">Target: {SLA_TIMES[k]}</p>
                    </div>
                    {deptData && deptData.total > 0 && (
                      <div className="text-right">
                        <p className={`text-sm font-bold ${colors.text}`}>{deptData.pct}%</p>
                        <p className="text-label-badge text-muted-foreground">{deptData.total} tickets</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk tickets */}
      <div className="bg-card border rounded-lg p-6 corp-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">SLA Risk Monitor — Tickets Approaching or Past Deadline</h3>
        {riskTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No tickets at risk — all within SLA targets</p>
        ) : (
          <table className="w-full text-table-cell">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Ticket ID", "Employee", "Category", "Priority", "Status", "Elapsed", "SLA Target", "Remaining"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-label-badge font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskTickets.map((t) => (
                <tr key={t.ticket_id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-primary text-label-badge">{t.ticket_id}</td>
                  <td className="px-4 py-3 text-label-badge font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-label-badge">{CATEGORIES[t.query_type]}</td>
                  <td className="px-4 py-3">
                    <span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${
                      t.priority === "HIGH" ? "bg-corp-red-light text-corp-red" :
                      t.priority === "MEDIUM" ? "bg-corp-amber-light text-corp-amber" :
                      "bg-corp-green-light text-corp-green"
                    }`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${
                      t.status === "escalated" ? "bg-corp-red-light text-corp-red" :
                      t.status === "in_progress" ? "bg-corp-amber-light text-corp-amber" :
                      "bg-primary-light text-primary"
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-label-badge text-muted-foreground">{Math.round(t.elapsed * 10) / 10}h</td>
                  <td className="px-4 py-3 text-label-badge text-muted-foreground">{t.targetHrs}h</td>
                  <td className="px-4 py-3">
                    <span className={`text-label-badge font-semibold ${t.remaining <= 0 ? "text-corp-red" : "text-corp-amber"}`}>
                      {t.remaining <= 0 ? `Breached by ${Math.abs(Math.round(t.remaining * 10) / 10)}h` : `${Math.round(t.remaining * 10) / 10}h left`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
