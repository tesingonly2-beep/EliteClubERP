import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/settlements")({
  component: SettlementsPage,
  head: () => ({
    meta: [
      { title: "Settlements — Elite Club" },
      { name: "description", content: "Partner settlement management" },
    ],
  }),
});

const settlements = [
  { partner: "The Vault", payable: "₹72,750", period: "Apr 2025", status: "Pending" },
  { partner: "Sky Lounge", payable: "₹51,300", period: "Apr 2025", status: "Pending" },
  { partner: "Noir Bar", payable: "₹44,700", period: "Apr 2025", status: "Paid" },
  { partner: "Amber Club", payable: "₹32,250", period: "Mar 2025", status: "Paid" },
  { partner: "Eclipse", payable: "₹26,400", period: "Apr 2025", status: "Pending" },
];

function SettlementsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Settlements</h1>
            <p className="text-sm text-muted-foreground mt-1">Partner-wise payable amounts and settlement status.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90 transition-opacity">
            <FileText className="h-4 w-4" /> Generate Invoice
          </button>
        </div>

        <div className="glass-panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Partner</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Payable Amount</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Period</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{s.partner}</td>
                    <td className="py-3 text-right font-medium text-gold">{s.payable}</td>
                    <td className="py-3 text-muted-foreground">{s.period}</td>
                    <td className="py-3 text-center">
                      <span className={s.status === "Paid" ? "status-active" : "status-pending"}>{s.status}</span>
                    </td>
                    <td className="py-3 text-center">
                      {s.status === "Pending" && (
                        <button className="rounded-md border border-gold/30 px-3 py-1 text-xs font-medium text-gold hover:bg-gold-muted transition-colors">
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
