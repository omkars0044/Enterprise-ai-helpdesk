import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getTickets, CATEGORIES, SLA_TIMES, DEPT_COLORS } from "@/lib/tickets";
import { useAuth } from "@/lib/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  FileText, CheckCircle2, Clock, AlertTriangle,
  Users, Monitor, Building2, KeyRound, Cpu, Wifi,
} from "lucide-react";

const DEPT_ICONS: Record<string, typeof Users> = {
  hr: Users, it: Monitor, admin: Building2, access: KeyRound,
};

const BAR_COLORS: Record<string, string> = {
  hr: "#a855f7",
  it: "#3b82f6",
  admin: "#10b981",
  access: "#f59e0b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-foreground">{label}: <span className="font-bold">{payload[0].value} Requests</span></p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tickets = useMemo(() => {
    const all = getTickets();
    if (user?.role === "Employee") return all.filter(t => t.email === user.email);
    if (user?.role === "Agent") return all.filter(t => t.assigned_to === user.username || t.assigned_to === user.email);
    return all;
  }, [user]);

  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === "resolved").length;
  const pending = tickets.filter(t => t.status === "in_progress" || t.status === "new").length;
  const breaches = tickets.filter(t => t.priority === "HIGH" && t.status !== "resolved").length;

  const stats = [
    { label: "Total Requests", value: total, color: "text-primary", bg: "bg-primary-light", icon: FileText },
    { label: "Resolved", value: resolved, color: "text-corp-green", bg: "bg-corp-green-light", icon: CheckCircle2 },
    { label: "Pending", value: pending, color: "text-corp-amber", bg: "bg-corp-amber-light", icon: Clock },
    { label: "SLA Breaches", value: breaches, color: "text-corp-red", bg: "bg-corp-red-light", icon: AlertTriangle },
  ];

  const deptCounts = useMemo(() => {
    const c: Record<string, number> = {};
    Object.keys(CATEGORIES).forEach(k => { c[k] = tickets.filter(t => t.query_type === k && t.status !== "resolved").length; });
    return c;
  }, [tickets]);

  const deptKeys = Object.keys(CATEGORIES);
  const chartData = deptKeys.map(k => ({
    dept: CATEGORIES[k].split(" ")[0],
    key: k,
    count: tickets.filter(t => t.query_type === k).length,
  }));

  const priorityCounts = { HIGH: tickets.filter(t => t.priority === "HIGH").length, MEDIUM: tickets.filter(t => t.priority === "MEDIUM").length, LOW: tickets.filter(t => t.priority === "LOW").length };

  const recent = tickets.slice(0, 6);

  const aiEngines = [
    { name: "HR AI", status: "Online" },
    { name: "IT AI", status: "Online" },
    { name: "Admin AI", status: "Online" },
    { name: "Access AI", status: "Online" },
  ];

  const handlePriorityClick = (priority: string) => {
    navigate(`/operations?priority=${priority}`);
  };

  const handleDeptClick = (deptKey: string) => {
    navigate(`/operations?dept=${deptKey}`);
  };

  const handleBarClick = (data: any) => {
    if (data?.key) handleDeptClick(data.key);
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border rounded-lg p-5 corp-shadow flex items-center gap-4">
            <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-label-badge text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CATEGORIES).map(([k, label]) => {
          const colors = DEPT_COLORS[k];
          const Icon = DEPT_ICONS[k] || Cpu;
          return (
            <div
              key={k}
              onClick={() => handleDeptClick(k)}
              className={`bg-card border rounded-lg p-5 corp-shadow border-l-4 ${colors.border} cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-8 w-8 rounded-md ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-label-badge text-muted-foreground">SLA: {SLA_TIMES[k]}</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${colors.text}`}>{deptCounts[k] || 0} <span className="text-label-badge font-normal text-muted-foreground">open</span></p>
            </div>
          );
        })}
        {/* AI Engine card */}
        <div className="bg-card border rounded-lg p-5 corp-shadow border-l-4 border-primary">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-md bg-primary-light flex items-center justify-center">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Engine</p>
              <p className="text-label-badge text-muted-foreground">Auto-resolution active</p>
            </div>
          </div>
          <p className="text-lg font-bold text-primary">{total > 0 ? Math.round((resolved / total) * 100) : 0}% <span className="text-label-badge font-normal text-muted-foreground">resolved</span></p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border rounded-lg p-5 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Request Volume by Department</h3>
          <div className="flex justify-center animate-fade-in">
            <div style={{ width: "85%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} style={{ cursor: "pointer" }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(214,32%,91%)", opacity: 0.2 }} />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    barSize={48}
                    onClick={handleBarClick}
                    animationDuration={500}
                    animationBegin={0}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={BAR_COLORS[entry.key] || "#3b82f6"} className="cursor-pointer hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Priority Breakdown</h3>
          <div className="space-y-3">
            {(["HIGH", "MEDIUM", "LOW"] as const).map(p => {
              const colors = { HIGH: "bg-corp-red text-corp-red hover:bg-corp-red-light", MEDIUM: "bg-corp-amber text-corp-amber hover:bg-corp-amber-light", LOW: "bg-corp-green text-corp-green hover:bg-corp-green-light" };
              const c = colors[p].split(" ");
              return (
                <button
                  key={p}
                  onClick={() => handlePriorityClick(p)}
                  className="w-full flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${c[0]}`} />
                    <span className="text-sm text-foreground group-hover:font-medium transition-all">{p}</span>
                  </div>
                  <span className={`text-sm font-semibold ${c[1]}`}>{priorityCounts[p]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border rounded-lg p-5 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No tickets yet — submit a request to get started.</p>
          ) : (
            <div className="space-y-3">
              {recent.map(t => (
                <div key={t.ticket_id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-label-badge text-muted-foreground font-mono">{t.ticket_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    <span className="text-label-badge text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border rounded-lg p-5 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI Engine Status</h3>
          <div className="space-y-3">
            {aiEngines.map(e => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-3.5 w-3.5 text-corp-green" />
                  <span className="text-sm text-foreground">{e.name}</span>
                </div>
                <span className="text-label-badge font-medium text-corp-green bg-corp-green-light px-2 py-0.5 rounded-full">{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    escalated: "bg-corp-red-light text-corp-red",
    in_progress: "bg-corp-amber-light text-corp-amber",
    resolved: "bg-corp-green-light text-corp-green",
    new: "bg-primary-light text-primary",
  };
  return <span className={`text-label-badge font-semibold px-2 py-0.5 rounded-full ${map[status] || map.new}`}>{status.replace("_", " ")}</span>;
}
