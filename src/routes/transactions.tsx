import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [
      { title: "Transactions — Elite Club" },
      { name: "description", content: "View all club transactions" },
    ],
  }),
});

const transactions = [
  { id: "TXN-001", member: "Rahul Sharma", partner: "The Vault", amount: "₹4,500", profit: "₹1,350", mode: "UPI", date: "2025-04-23", time: "21:30" },
  { id: "TXN-002", member: "Neha Gupta", partner: "Sky Lounge", amount: "₹2,800", profit: "₹840", mode: "Card", date: "2025-04-23", time: "20:15" },
  { id: "TXN-003", member: "Vikash Kumar", partner: "Noir Bar", amount: "₹6,200", profit: "₹1,860", mode: "Cash", date: "2025-04-22", time: "22:45" },
  { id: "TXN-004", member: "Ananya Singh", partner: "The Vault", amount: "₹3,100", profit: "₹930", mode: "UPI", date: "2025-04-22", time: "19:00" },
  { id: "TXN-005", member: "Sneha Reddy", partner: "Eclipse", amount: "₹1,900", profit: "₹570", mode: "Card", date: "2025-04-21", time: "21:15" },
];

function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">All billing transactions across partners.</p>
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
                  <th className="pb-3 text-center font-medium text-muted-foreground">Mode</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="py-3 font-medium text-foreground">{t.member}</td>
                    <td className="py-3 text-foreground">{t.partner}</td>
                    <td className="py-3 text-right font-medium text-foreground">{t.amount}</td>
                    <td className="py-3 text-right text-gold">{t.profit}</td>
                    <td className="py-3 text-center">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{t.mode}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{t.date}</td>
                    <td className="py-3 text-muted-foreground">{t.time}</td>
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
