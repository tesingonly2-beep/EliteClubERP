import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { RotateCcw, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Elite Club" }] }),
});

function SettingsPage() {
  const { resetData } = useStore();
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your club configuration.</p>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground">{user?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <span className="text-foreground capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-display text-lg font-semibold mb-2">Club Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">Profit split is configured per transaction.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
              <span className="text-sm text-foreground">Club Share</span>
              <span className="font-semibold text-gold">50%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
              <span className="text-sm text-foreground">Partner Share</span>
              <span className="font-semibold text-gold">50%</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 border-destructive/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-lg font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">Reset all data to seed defaults. This cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={() => { if (confirm("Reset all data?")) resetData(); }}
            className="flex items-center gap-2 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="h-4 w-4" /> Reset All Data
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
