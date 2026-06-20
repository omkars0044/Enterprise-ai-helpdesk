export interface Ticket {
  ticket_id: string;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  query_type: string;
  message: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "escalated" | "in_progress" | "resolved" | "new";
  ai_response: string;
  next_action: string;
  timestamp: string;
  assigned_to?: string;
}

export function getTickets(): Ticket[] {
  try {
    return JSON.parse(localStorage.getItem("cd_tickets") || "[]");
  } catch { return []; }
}

export function saveTicket(t: Ticket) {
  const tickets = getTickets();
  tickets.unshift(t);
  localStorage.setItem("cd_tickets", JSON.stringify(tickets));
}

export function updateTicketStatus(ticketId: string, newStatus: Ticket["status"]) {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.ticket_id === ticketId);
  if (idx !== -1) {
    tickets[idx].status = newStatus;
    localStorage.setItem("cd_tickets", JSON.stringify(tickets));
  }
  return tickets[idx] || null;
}

export function clearTickets() {
  localStorage.removeItem("cd_tickets");
}

export function detectPriority(message: string, category: string): "HIGH" | "MEDIUM" | "LOW" {
  const m = message.toLowerCase();
  const highWords = ["urgent", "blocking", "blocked", "not working", "down", "critical", "emergency", "outage", "escalate", "immediate", "asap", "cannot work", "stuck"];
  const medWords = ["pending", "delay", "slow", "issue", "problem", "error", "waiting", "not approved", "not responding"];
  if (highWords.some(w => m.includes(w))) return "HIGH";
  if (medWords.some(w => m.includes(w))) return "MEDIUM";
  return "LOW";
}

export function getDemoResponse(category: string, name: string, ticketId: string, priority: string) {
  const isHigh = priority === "HIGH";
  const responses: Record<string, { ai_response: string; next_action: string }> = {
    hr: {
      ai_response: `Dear ${name}, your HR request (${ticketId}) has been received by People Operations Team. ${isHigh ? "ESCALATED to senior HR — contact within 1 hour." : "Will be reviewed within 24-48 hours."}`,
      next_action: isHigh ? "Senior HR will contact you within 1 hour" : "HR team will review and respond within 24-48 hours",
    },
    it: {
      ai_response: `Dear ${name}, your IT incident (${ticketId}) is logged with ${priority} priority. ${isHigh ? "P1 CRITICAL — IT team responding immediately." : "Engineer assigned within 2-6 hours."}`,
      next_action: isHigh ? "IT team responding immediately" : "Engineer will be assigned within 2-6 hours",
    },
    admin: {
      ai_response: `Dear ${name}, Admin request (${ticketId}) forwarded to Admin & Facilities. ${isHigh ? "Urgent — 2 hours." : "12-24 hours."}`,
      next_action: isHigh ? "Admin team will respond within 2 hours" : "Admin team will respond within 12-24 hours",
    },
    access: {
      ai_response: `Dear ${name}, access request (${ticketId}) sent to IT Security for approval. ${isHigh ? "Fast-tracked — 1 hour." : "4-8 hours."}`,
      next_action: isHigh ? "IT Security fast-tracking — 1 hour" : "IT Security will process within 4-8 hours",
    },
  };
  return responses[category] || responses.it;
}

export function exportTicketsCSV() {
  const tickets = getTickets();
  if (!tickets.length) return;
  const headers = ["Ticket ID", "Name", "Email", "Employee ID", "Department", "Category", "Priority", "Status", "Message", "AI Response", "Timestamp"];
  const rows = tickets.map(t => [t.ticket_id, t.name, t.email, t.employee_id, t.department, t.query_type, t.priority, t.status, `"${t.message.replace(/"/g, '""')}"`, `"${t.ai_response.replace(/"/g, '""')}"`, t.timestamp]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `helpdesk_tickets_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportReportCSV() {
  const tickets = getTickets();
  if (!tickets.length) return;
  const headers = ["Ticket ID", "Name", "Email", "Employee ID", "Department", "Category", "Priority", "Status", "Message", "AI Response", "Next Action", "Timestamp"];
  const rows = tickets.map(t => [t.ticket_id, t.name, t.email, t.employee_id, t.department, t.query_type, t.priority, t.status, `"${t.message.replace(/"/g, '""')}"`, `"${t.ai_response.replace(/"/g, '""')}"`, `"${(t.next_action || "").replace(/"/g, '""')}"`, t.timestamp]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `helpdesk_report_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const CATEGORIES: Record<string, string> = {
  hr: "HR Department",
  it: "IT Department",
  admin: "Admin Department",
  access: "Access & Permission Department",
};

export const SLA_TIMES: Record<string, string> = {
  hr: "24-48 hrs",
  it: "2-6 hrs",
  admin: "12-24 hrs",
  access: "4-8 hrs",
};

export const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  hr: { bg: "bg-corp-purple-light", text: "text-corp-purple", border: "border-corp-purple" },
  it: { bg: "bg-primary-light", text: "text-primary", border: "border-primary" },
  admin: { bg: "bg-corp-teal-light", text: "text-corp-teal", border: "border-corp-teal" },
  access: { bg: "bg-corp-amber-light", text: "text-corp-amber", border: "border-corp-amber" },
};

export const WEBHOOK_URL = "https://jackautomationalai.app.n8n.cloud/webhook/internal-request";
export const STATUS_WEBHOOK = "https://jackautomationalai.app.n8n.cloud/webhook/status-update";
export const API_KEY = "BPA_SECRET_2024";
