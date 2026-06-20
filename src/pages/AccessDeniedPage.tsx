import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShieldAlert className="h-16 w-16 text-corp-red mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
      <p className="text-sm text-muted-foreground mb-6">You don't have permission to view this page.</p>
      <button onClick={() => navigate("/")} className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
        Go to Dashboard
      </button>
    </div>
  );
}
