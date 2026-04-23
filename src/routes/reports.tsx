import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Reports — Elite Club" },
      { name: "description", content: "Analytics and reports" },
    ],
  }),
});

function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and view detailed analytics reports.</p>
        </div>
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">Reports module coming soon. Revenue, membership, and partner analytics will be available here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
