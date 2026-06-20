import { useState } from "react";
import { exportTicketsCSV, clearTickets } from "@/lib/tickets";
import { toast } from "sonner";
import { Save, RotateCcw, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [company, setCompany] = useState(localStorage.getItem("cd_company") || "");
  const [showConfirm, setShowConfirm] = useState(false);

  const saveSettings = () => {
    localStorage.setItem("cd_company", company);
    toast.success("Settings saved");
  };

  const resetSettings = () => {
    setCompany("");
    localStorage.removeItem("cd_company");
    toast.info("Settings reset");
  };

  const handleClear = () => {
    clearTickets();
    setShowConfirm(false);
    toast.success("All ticket data cleared");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      {/* Left */}
      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Company Configuration</h3>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Company Name</label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your Company" className="w-full h-9 px-3 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={saveSettings} className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition">
              <Save className="h-4 w-4" /> Save Settings
            </button>
            <button onClick={resetSettings} className="flex items-center gap-1.5 h-9 px-4 rounded-md border text-sm font-medium hover:bg-muted transition">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">Data Management</h3>
          <div className="space-y-3">
            <button onClick={exportTicketsCSV} className="w-full flex items-center justify-center gap-2 h-9 rounded-md border text-sm font-medium hover:bg-muted transition">
              <Download className="h-4 w-4" /> Export All Tickets
            </button>
            {showConfirm ? (
              <div className="border border-corp-red rounded-md p-3 bg-corp-red-light">
                <p className="text-xs text-corp-red mb-2">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={handleClear} className="h-8 px-3 rounded-md bg-corp-red text-primary-foreground text-xs font-medium hover:opacity-90 transition">Yes, Clear All</button>
                  <button onClick={() => setShowConfirm(false)} className="h-8 px-3 rounded-md border text-xs font-medium hover:bg-muted transition">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowConfirm(true)} className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-corp-red-light text-corp-red text-sm font-medium hover:bg-corp-red/10 transition">
                <Trash2 className="h-4 w-4" /> Clear All Data
              </button>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 corp-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">System Information</h3>
          <div className="space-y-2 text-sm">
            {[
              ["System", "HelpDesk v2.0"],
              ["Project By", "Omkar Sonawane"],
              ["PRN", "46423000420"],
              ["Course", "BCA Cyber Security"],
              ["University", "TMV Pune"],
              ["Workflow", "n8n Cloud"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
