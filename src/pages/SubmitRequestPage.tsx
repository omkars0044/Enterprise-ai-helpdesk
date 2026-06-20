import { useState, FormEvent } from "react";
import { detectPriority, getDemoResponse, saveTicket, CATEGORIES, SLA_TIMES, DEPT_COLORS, WEBHOOK_URL, API_KEY } from "@/lib/tickets";
import { toast } from "sonner";
import { Send, RotateCcw, Zap, Clock, ArrowRight } from "lucide-react";

export default function SubmitRequestPage() {
  const [form, setForm] = useState({ name: "", email: "", employee_id: "", department: "", category: "it", description: "" });
  const [response, setResponse] = useState<{ ticket_id: string; priority: string; ai_response: string; next_action: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const priority = detectPriority(form.description, form.category);
    const ticketId = "TKT-" + Date.now();

    let ai_response = "";
    let next_action = "";

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({
          name: form.name, email: form.email, employee_id: form.employee_id,
          department: form.department, query_type: form.category,
          message: form.description, api_key: API_KEY, priority,
        }),
      });
      const data = await res.json();
      ai_response = data.ai_response || data.message || JSON.stringify(data);
      next_action = data.next_action || "Ticket routed via n8n workflow";
      toast.success("Request submitted via n8n");
    } catch {
      toast.error("Webhook error — saved locally");
      const demo = getDemoResponse(form.category, form.name, ticketId, priority);
      ai_response = demo.ai_response;
      next_action = demo.next_action;
    }

    saveTicket({
      ticket_id: ticketId, name: form.name, email: form.email,
      employee_id: form.employee_id, department: form.department,
      query_type: form.category, message: form.description,
      priority, status: priority === "HIGH" ? "escalated" : "in_progress",
      ai_response, next_action, timestamp: new Date().toISOString(),
    });

    setResponse({ ticket_id: ticketId, priority, ai_response, next_action, message: form.description });
    setLoading(false);
  };

  const handleClear = () => {
    setForm({ name: "", email: "", employee_id: "", department: "", category: "it", description: "" });
    setResponse(null);
  };

  const prioColors: Record<string, string> = { HIGH: "bg-corp-red-light text-corp-red", MEDIUM: "bg-corp-amber-light text-corp-amber", LOW: "bg-corp-green-light text-corp-green" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-3">
        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-base font-semibold text-foreground mb-5">New Support Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Employee Name *" value={form.name} onChange={v => set("name", v)} required />
              <Field label="Work Email *" value={form.email} onChange={v => set("email", v)} type="email" required />
              <Field label="Employee ID" value={form.employee_id} onChange={v => set("employee_id", v)} />
              <Field label="Department" value={form.department} onChange={v => set("department", v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full h-10 px-3 rounded-md border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} required className="w-full px-3 py-2 rounded-md border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50">
                <Send className="h-4 w-4" /> Submit Request →
              </button>
              <button type="button" onClick={handleClear} className="flex items-center gap-2 h-10 px-4 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition">
                <RotateCcw className="h-4 w-4" /> Clear
              </button>
            </div>
          </form>

          {/* Response box */}
          {response && (
            <div className="mt-6 border rounded-lg p-5 bg-background animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-label-badge font-mono bg-primary-light text-primary px-2 py-1 rounded">{response.ticket_id}</span>
                <span className={`text-label-badge font-semibold px-2 py-1 rounded ${prioColors[response.priority]}`}>{response.priority}</span>
                {response.priority === "HIGH" && <span className="text-label-badge font-semibold px-2 py-1 rounded bg-corp-red-light text-corp-red">Follow-up Required</span>}
              </div>

              {/* Original Query Section */}
              <div className="my-4 border-t border-b py-3">
                <p className="text-label-badge font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your Original Query:</p>
                <p className="text-sm text-foreground italic bg-muted/50 px-3 py-2 rounded">"{response.message}"</p>
              </div>

              <p className="text-sm text-foreground mb-3">{response.ai_response}</p>
              <div className="flex items-center gap-2 text-sm bg-primary-light text-primary px-3 py-2 rounded-md">
                <ArrowRight className="h-4 w-4" /> {response.next_action}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card border border-corp-red rounded-lg p-5 corp-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-corp-red" />
            <h4 className="text-sm font-semibold text-foreground">Priority Engine Active</h4>
          </div>
          <p className="text-label-badge text-muted-foreground">Keywords like <span className="font-medium text-foreground">urgent, blocking, down, critical</span> = HIGH priority</p>
        </div>


        <div className="bg-card border rounded-lg p-5 corp-shadow">
          <h4 className="text-sm font-semibold text-foreground mb-3">Auto Routing</h4>
          <div className="space-y-2 text-label-badge">
            {[
              ["HR", "People Operations"],
              ["IT", "IT Service Desk"],
              ["Admin", "Facilities Team"],
              ["Access", "Security Team"],
            ].map(([from, to]) => (
              <div key={from} className="flex items-center gap-2">
                <span className="font-medium text-foreground">{from}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full h-10 px-3 rounded-md border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
    </div>
  );
}
