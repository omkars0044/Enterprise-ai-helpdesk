import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = login(username, password);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="bg-card rounded-lg corp-shadow-md border p-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight"><h1 className="text-2xl font-bold text-foreground tracking-tight">HelpDesk</h1></h1>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-8">Enterprise Internal Automation</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Employee ID / Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                className="w-full h-10 px-3 rounded-md border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                className="w-full h-10 px-3 rounded-md border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                required
              />
            </div>
            {error && <p className="text-sm text-corp-red">{error}</p>}
            <button type="submit" className="w-full h-10 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-[0.98] transition">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
