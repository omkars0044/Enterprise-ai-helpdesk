import { FileInput, CheckSquare, Gauge, GitBranch, Cpu, Bell, Database, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: FileInput, label: "Employee Request", color: "bg-primary-light text-primary border-primary" },
  { icon: CheckSquare, label: "Validation", color: "bg-corp-green-light text-corp-green border-corp-green" },
  { icon: Gauge, label: "Priority Engine", color: "bg-corp-amber-light text-corp-amber border-corp-amber" },
  { icon: GitBranch, label: "Dept Routing", color: "bg-corp-purple-light text-corp-purple border-corp-purple" },
  { icon: Cpu, label: "AI Response", color: "bg-primary-light text-primary border-primary" },
  { icon: Bell, label: "Notification", color: "bg-corp-teal-light text-corp-teal border-corp-teal" },
  { icon: Database, label: "Logging", color: "bg-muted text-muted-foreground border-border" },
];

const PRIORITY_RULES = [
  { level: "HIGH", color: "border-corp-red bg-corp-red-light", text: "text-corp-red", words: "urgent, blocking, not working, down, critical, emergency, outage" },
  { level: "MEDIUM", color: "border-corp-amber bg-corp-amber-light", text: "text-corp-amber", words: "pending, delay, slow, issue, problem, error, waiting" },
  { level: "LOW", color: "border-corp-green bg-corp-green-light", text: "text-corp-green", words: "All general requests" },
];

const ROUTING = [
  { from: "HR Request", to: "People Operations", sla: "48h" },
  { from: "IT Incident", to: "IT Service Desk", sla: "6h" },
  { from: "Escalation", to: "Dept Manager", sla: "2h" },
  { from: "Admin & Ops", to: "Admin & Facilities", sla: "24h" },
  { from: "Access", to: "IT Security", sla: "8h" },
];

const TECH = ["n8n", "AI Engine", "Gmail SMTP", "API Key Auth", "LocalStorage", "CSV Export"];

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      {/* Pipeline */}
      <div className="bg-card border rounded-lg p-6 corp-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-5">Automation Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`flex flex-col items-center gap-1.5 min-w-[80px]`}>
                <div className={`h-10 w-10 rounded-lg border ${s.color} flex items-center justify-center`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-foreground text-center">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Rules + Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Priority Detection Rules</h3>
          <div className="space-y-3">
            {PRIORITY_RULES.map(r => (
              <div key={r.level} className={`border rounded-md p-3 ${r.color}`}>
                <p className={`text-sm font-semibold ${r.text}`}>{r.level}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.words}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Routing Logic</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">Routes To</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">SLA</th>
              </tr>
            </thead>
            <tbody>
              {ROUTING.map(r => (
                <tr key={r.from} className="border-b last:border-0">
                  <td className="py-2.5 text-xs font-medium text-foreground">{r.from}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{r.to}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{r.sla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-card border rounded-lg p-6 corp-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tech Stack</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TECH.map(t => (
            <div key={t} className="border rounded-md p-3 text-center">
              <p className="text-sm font-medium text-foreground">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
