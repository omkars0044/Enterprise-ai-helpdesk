import { CheckCircle2 } from "lucide-react";

const REQ_BODY = `{
  "name": "Rahul Sharma",
  "email": "rahul@company.com",
  "employee_id": "EMP-1042",
  "department": "Finance",
  "query_type": "it",
  "message": "Laptop not booting",
  "api_key": "BPA_SECRET_2024"
}`;

const RES_BODY = `{
  "status": "success",
  "ticket_id": "TKT-1710432000000",
  "priority": "HIGH",
  "ai_response": "IT incident logged with P1 priority...",
  "next_action": "IT team responding immediately"
}`;

const CURL = `curl -X POST \\
  https://your-n8n.app/webhook/internal-request \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: BPA_SECRET_2024" \\
  -d '${REQ_BODY.replace(/\n/g, "\\n")}'`;

export default function DeveloperPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-card border rounded-lg p-6 corp-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">POST /webhook/internal-request</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Main API endpoint for ticket submission</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-corp-green bg-corp-green-light px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        </div>

        <div className="space-y-4">
          <CodeBlock title="Authentication Headers" code={`Content-Type: application/json\nx-api-key: BPA_SECRET_2024`} />
          <CodeBlock title="Request Body" code={REQ_BODY} />
          <CodeBlock title="Response" code={RES_BODY} />
          <CodeBlock title="cURL Example" code={CURL} />
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{title}</p>
      <pre className="bg-foreground text-primary-foreground text-xs p-4 rounded-md overflow-x-auto font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
