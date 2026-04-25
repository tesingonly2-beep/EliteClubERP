import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useMemo, useState } from "react";
import { Search, Plus, X, MapPin, Star, Clock, TrendingUp, Users, Receipt, Crown, Trash2, Power } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/partners")({
  component: PartnersPage,
  head: () => ({ meta: [{ title: "Partners — Elite Club" }] }),
});

function PartnersPage() {
  const { partners, transactions, addPartner, updatePartner, deletePartner } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Active" | "Inactive">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", owner: "", location: "", status: "Active" as "Active" | "Inactive" });

  const enriched = useMemo(() => {
    return partners.map((p) => {
      const txns = transactions.filter((t) => t.partnerId === p.id);
      return {
        ...p,
        revenue: txns.reduce((s, t) => s + t.subtotal, 0),
        clubShare: txns.reduce((s, t) => s + t.clubShare, 0),
        txnCount: txns.length,
        memberCount: new Set(txns.map((t) => t.memberId)).size,
        recent: txns.slice(0, 3),
      };
    });
  }, [partners, transactions]);

  const filtered = enriched.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const detail = selectedId ? enriched.find((p) => p.id === selectedId) : null;

  const totals = {
    count: enriched.length,
    active: enriched.filter((p) => p.status === "Active").length,
    revenue: enriched.reduce((s, p) => s + p.revenue, 0),
  };

  const handleAdd = () => {
    if (!form.name || !form.owner) return;
    addPartner(form);
    setForm({ name: "", owner: "", location: "", status: "Active" });
    setShowAdd(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Partners</h1>
            <p className="text-sm text-muted-foreground mt-1">{totals.count} venues · {totals.active} active · {formatINR(totals.revenue)} all-time revenue</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90 shadow-lg shadow-gold/20"
          >
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[16rem] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by name or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {(["all", "Active", "Inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 h-8 rounded-md text-xs font-semibold capitalize transition-colors ${
                  filter === f ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              onClick={() => setSelectedId(p.id)}
              className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-gold/60 hover:shadow-[0_10px_40px_-15px_oklch(0.78_0.12_75/0.5)] transition-all"
            >
              <div className="relative h-32 overflow-hidden bg-secondary">
                {p.photo ? (
                  <img src={p.photo} alt={p.name} loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Crown className="h-8 w-8 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
                    p.status === "Active" ? "bg-success/20 text-success border border-success/40" : "bg-destructive/20 text-destructive border border-destructive/40"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.status === "Active" ? "bg-success animate-pulse" : "bg-destructive"}`} />
                    {p.status}
                  </span>
                </div>
                {p.rating !== undefined && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-[11px] font-semibold border border-gold/30">
                    <Star className="h-3 w-3 text-gold fill-gold" />
                    <span className="text-foreground">{p.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground leading-tight">{p.name}</h3>
                  {p.cuisine && <p className="text-[11px] uppercase tracking-wider text-gold font-semibold mt-0.5">{p.cuisine}</p>}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{p.location}</span></div>
                  {p.hours && <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" /><span>{p.hours}</span></div>}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                  <Mini label="Revenue" value={formatINR(p.revenue)} />
                  <Mini label="Bills" value={String(p.txnCount)} />
                  <Mini label="Members" value={String(p.memberCount)} />
                </div>
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground glass-panel">
              <Crown className="h-10 w-10 mx-auto opacity-30 mb-2" />
              No partners match your filters.
            </div>
          )}
        </div>

        {/* Detail drawer */}
        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4" onClick={() => setSelectedId(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card shadow-2xl gold-glow"
            >
              <div className="relative h-44 overflow-hidden">
                {detail.photo && <img src={detail.photo} alt={detail.name} className="h-full w-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <button onClick={() => setSelectedId(null)} className="absolute top-3 right-3 rounded-lg bg-background/70 backdrop-blur p-1.5 text-muted-foreground hover:text-foreground border border-border">
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      {detail.cuisine && <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">{detail.cuisine}</p>}
                      <h2 className="font-display text-3xl font-bold text-foreground">{detail.name}</h2>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{detail.location}</span>
                        {detail.hours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{detail.hours}</span>}
                      </div>
                    </div>
                    <span className={detail.status === "Active" ? "status-active" : "status-inactive"}>{detail.status}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat icon={<TrendingUp className="h-4 w-4" />} label="Revenue" value={formatINR(detail.revenue)} highlight />
                  <Stat icon={<Crown className="h-4 w-4" />} label="Club Share" value={formatINR(detail.clubShare)} />
                  <Stat icon={<Receipt className="h-4 w-4" />} label="Bills" value={String(detail.txnCount)} />
                  <Stat icon={<Users className="h-4 w-4" />} label="Members" value={String(detail.memberCount)} />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Owner</p>
                  <p className="text-sm text-foreground">{detail.owner}</p>
                </div>

                {detail.recent.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Recent Transactions</p>
                    <div className="rounded-lg border border-border/60 bg-background/40 divide-y divide-border/50">
                      {detail.recent.map((t) => (
                        <div key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                          <div>
                            <p className="font-medium text-foreground">{t.memberName}</p>
                            <p className="text-[11px] text-muted-foreground">{t.receiptNo} · {new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
                          </div>
                          <span className="font-semibold text-gold">{formatINR(t.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => updatePartner(detail.id, { status: detail.status === "Active" ? "Inactive" : "Active" })}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-accent"
                  >
                    <Power className="h-3.5 w-3.5" /> {detail.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete ${detail.name}?`)) { deletePartner(detail.id); setSelectedId(null); } }}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-destructive/30 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
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
    </DashboardLayout>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground tabular-nums truncate">{value}</p>
    </div>
  );
}

function Stat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-gold/40 bg-gold-muted" : "border-border bg-background/40"}`}>
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${highlight ? "text-gold" : "text-muted-foreground"}`}>
        {icon} {label}
      </div>
      <p className={`mt-1 text-base font-display font-bold ${highlight ? "text-gold" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
