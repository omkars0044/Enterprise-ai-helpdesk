import { Mail, Workflow, MessageSquare, HardDrive, Sheet, Hash, Calendar, Users } from "lucide-react";

const INTEGRATIONS = [
  { name: "Gmail", icon: Mail, status: "Connected", active: true },
  { name: "n8n Workflows", icon: Workflow, status: "Active", active: true },
  { name: "Microsoft Teams", icon: MessageSquare, status: "Connect →", active: false },
  { name: "SharePoint", icon: HardDrive, status: "Connect →", active: false },
  { name: "Google Sheets", icon: Sheet, status: "Connect →", active: false },
  { name: "Slack", icon: Hash, status: "Connect →", active: false },
  { name: "Google Calendar", icon: Calendar, status: "Connect →", active: false },
  { name: "HRMS System", icon: Users, status: "Connect →", active: false },
];

export default function IntegrationsPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {INTEGRATIONS.map(item => (
        <div key={item.name} className="bg-card border rounded-lg p-5 corp-shadow hover:border-primary hover:corp-shadow-md transition-all cursor-pointer group">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary-light transition">
            <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">{item.name}</p>
          <span className={`text-xs font-medium ${item.active ? "text-corp-green" : "text-muted-foreground"}`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}
