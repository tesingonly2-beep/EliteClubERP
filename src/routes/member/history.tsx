import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR } from "@/lib/store";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/member/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — Elite Club" }] }),
});

function HistoryPage() {
  const { user } = useAuth();
  const { transactions } = useStore();
  const [search, setSearch] = useState("");

  const myTxns = transactions
    .filter((t) => t.memberId === user?.memberId)
    .filter((t) => t.partnerName.toLowerCase().includes(search.toLowerCase()));

  const total = myTxns.reduce((s, t) => s + t.subtotal, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Purchase History</h1>
          <p className="text-sm text-muted-foreground mt-1">All your transactions across partner venues.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="glass-panel p-5">
            <p className="text-sm text-muted-foreground">Total Purchases</p>
            <p className="font-display text-2xl font-bold text-foreground mt-1">{myTxns.length}</p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="font-display text-2xl font-bold text-gold mt-1">{formatINR(total)}</p>
          </div>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by venue..."
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
        </div>

        <div className="space-y-3">
          {myTxns.map((t) => (
            <div key={t.id} className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{t.partnerName}</p>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] uppercase">{t.paymentMode}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{new Date(t.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {t.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{it.name} ×{it.qty}</span>
                        <span className="text-foreground">{formatINR(it.mrp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-gold">{formatINR(t.subtotal)}</p>
              </div>
            </div>
          ))}
          {myTxns.length === 0 && (
            <div className="glass-panel p-12 text-center">
              <p className="text-muted-foreground">No purchases yet. Visit a partner venue to get started!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
