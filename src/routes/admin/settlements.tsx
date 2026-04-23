import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";

export const Route = createFileRoute("/admin/settlements")({
  component: SettlementsPage,
  head: () => ({ meta: [{ title: "Settlements — Elite Club" }] }),
});

function SettlementsPage() {
  const { settlements, markSettlementPaid } = useStore();
  const pending = settlements.filter((s) => s.status === "Pending").reduce((sum, s) => sum + s.amount, 0);
  const paid = settlements.filter((s) => s.status === "Paid").reduce((sum, s) => sum + s.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Settlements</h1>
            <p className="text-sm text-muted-foreground mt-1">Partner payable amounts and history.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90">
            <FileText className="h-4 w-4" /> Generate Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="glass-panel p-5">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            <p className="font-display text-2xl font-bold text-warning mt-1">{formatINR(pending)}</p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-sm text-muted-foreground">Total Settled</p>
            <p className="font-display text-2xl font-bold text-success mt-1">{formatINR(paid)}</p>
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Partner</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Period</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 font-medium text-foreground">{s.partnerName}</td>
                    <td className="py-3 text-right font-medium text-gold">{formatINR(s.amount)}</td>
                    <td className="py-3 text-muted-foreground">{s.period}</td>
                    <td className="py-3 text-center">
                      <span className={s.status === "Paid" ? "status-active" : "status-pending"}>{s.status}</span>
                    </td>
                    <td className="py-3 text-center">
                      {s.status === "Pending" && (
                        <button onClick={() => markSettlementPaid(s.id)} className="rounded-md border border-gold/30 px-3 py-1 text-xs font-medium text-gold hover:bg-gold-muted">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
