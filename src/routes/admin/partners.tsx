import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Search, Plus, MoreHorizontal, X } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";

export const Route = createFileRoute("/admin/partners")({
  component: PartnersPage,
  head: () => ({ meta: [{ title: "Partners — Elite Club" }] }),
});

function PartnersPage() {
  const { partners, transactions, members, addPartner, updatePartner, deletePartner } = useStore();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", owner: "", location: "", status: "Active" as "Active" | "Inactive" });

  const filtered = partners.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const detail = selectedId ? partners.find((p) => p.id === selectedId) : null;
  const detailTxns = detail ? transactions.filter((t) => t.partnerId === detail.id) : [];
  const detailRevenue = detailTxns.reduce((s, t) => s + t.subtotal, 0);
  const detailMembers = detail ? new Set(detailTxns.map((t) => t.memberId)).size : 0;

  const handleAdd = () => {
    if (!form.name || !form.owner) return;
    addPartner(form);
    setForm({ name: "", owner: "", location: "", status: "Active" });
    setShowAdd(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Partners</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all club partners.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" placeholder="Search partners..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="flex gap-6">
          <div className={`glass-panel p-5 ${detail ? "flex-1" : "w-full"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Partner</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Owner</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Location</th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedId(p.id)} className={`border-b border-border/50 cursor-pointer ${selectedId === p.id ? "bg-gold-muted" : "hover:bg-accent/30"}`}>
                      <td className="py-3 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 text-foreground">{p.owner}</td>
                      <td className="py-3 text-muted-foreground">{p.location}</td>
                      <td className="py-3 text-center">
                        <span className={p.status === "Active" ? "status-active" : "status-inactive"}>{p.status}</span>
                      </td>
                      <td className="py-3"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {detail && (
            <div className="glass-panel p-5 w-80 shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">{detail.name}</h3>
                <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                {[
                  ["Revenue", formatINR(detailRevenue)],
                  ["Transactions", String(detailTxns.length)],
                  ["Unique Members", String(detailMembers)],
                  ["Owner", detail.owner],
                  ["Location", detail.location],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updatePartner(detail.id, { status: detail.status === "Active" ? "Inactive" : "Active" })}
                  className="flex-1 rounded-md border border-border py-2 text-xs font-medium text-foreground hover:bg-accent"
                >
                  Toggle Status
                </button>
                <button
                  onClick={() => { deletePartner(detail.id); setSelectedId(null); }}
                  className="flex-1 rounded-md border border-destructive/30 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">Recent Transactions:</p>
                {detailTxns.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex justify-between py-1 border-t border-border/50">
                    <span>{t.memberName}</span>
                    <span className="text-gold">{formatINR(t.subtotal)}</span>
                  </div>
                ))}
                {detailTxns.length === 0 && <p>No transactions yet</p>}
              </div>
            </div>
          )}
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <div onClick={(e) => e.stopPropagation()} className="glass-panel p-6 w-full max-w-md gold-glow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-semibold">Add Partner</h3>
                <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <input placeholder="Partner Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
                <input placeholder="Owner Name" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
                <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button onClick={handleAdd} className="h-10 w-full rounded-lg bg-gold text-gold-foreground font-semibold hover:opacity-90">Add Partner</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {void members && null}
    </DashboardLayout>
  );
}
