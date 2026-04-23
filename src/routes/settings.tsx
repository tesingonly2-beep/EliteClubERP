import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Elite Club" },
      { name: "description", content: "Club settings and configuration" },
    ],
  }),
});

function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure club settings and preferences.</p>
        </div>
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">Settings and configuration panel coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
