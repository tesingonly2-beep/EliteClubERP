import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useStore, formatINR } from "@/lib/store";

export const Route = createFileRoute("/admin/transactions")({
  component: TxnPage,
  head: () => ({ meta: [{ title: "Transactions — Elite Club" }] }),
});

function TxnPage() {
  const { transactions } = useStore();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">All billing transactions ({transactions.length} total).</p>
        </div>

        <div className="glass-panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">ID</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Partner</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Profit</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Club Share</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Mode</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 font-mono text-xs text-muted-foreground">{t.id.slice(0, 10)}</td>
                    <td className="py-3 font-medium text-foreground">{t.memberName}</td>
                    <td className="py-3 text-foreground">{t.partnerName}</td>
                    <td className="py-3 text-right font-medium text-foreground">{formatINR(t.subtotal)}</td>
                    <td className="py-3 text-right text-gold">{formatINR(t.profit)}</td>
                    <td className="py-3 text-right text-foreground">{formatINR(t.clubShare)}</td>
                    <td className="py-3 text-center"><span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">{t.paymentMode}</span></td>
                    <td className="py-3 text-muted-foreground">{new Date(t.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No transactions yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
