import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Search, Filter, Plus, X, Eye } from "lucide-react";
import { useStore, isExpired, type Member, type Plan, PLAN_DAYS } from "@/lib/store";
import { MemberProfileModal } from "@/components/MemberProfileModal";

export const Route = createFileRoute("/admin/members")({
  component: MembersPage,
  head: () => ({ meta: [{ title: "Members — Elite Club" }] }),
});

function MembersPage() {
  const { members, addMember } = useStore();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"All" | Plan>("All");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", plan: "Daily" as Plan });

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchPlan = planFilter === "All" || m.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const handleAdd = () => {
    if (!form.name || !form.phone) return;
    const days = PLAN_DAYS[form.plan];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    addMember({ ...form, expiry: expiry.toISOString() });
    setForm({ name: "", phone: "", email: "", plan: "Daily" });
    setShowAdd(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Members</h1>
            <p className="text-sm text-muted-foreground mt-1">All registered club members.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["All", "Daily", "Octa", "Yearly"] as const).map((p) => (
              <button key={p} onClick={() => setPlanFilter(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${planFilter === p ? "bg-gold text-gold-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Phone</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Expiry</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Visits</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Spent</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const expired = isExpired(m.expiry);
                  return (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-3 font-medium text-foreground">{m.name}</td>
                      <td className="py-3 text-muted-foreground">{m.phone}</td>
                      <td className="py-3"><span className="rounded-md bg-gold-muted px-2 py-0.5 text-xs font-medium text-gold">{m.plan}</span></td>
                      <td className="py-3 text-foreground">{new Date(m.expiry).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 text-right text-foreground">{m.visits}</td>
                      <td className="py-3 text-right text-foreground">₹{m.totalSpent.toLocaleString("en-IN")}</td>
                      <td className="py-3 text-center">
                        <span className={expired ? "status-inactive" : "status-active"}>{expired ? "Expired" : "Active"}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelected(m)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold-muted px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold hover:text-gold-foreground transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No members found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <div onClick={(e) => e.stopPropagation()} className="glass-panel p-6 w-full max-w-md gold-glow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-semibold">Add Member</h3>
                <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
                <input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none" />
                <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as Plan })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none">
                  <option value="Daily">Daily Pass — ₹500</option>
                  <option value="Octa">Octa Pass — ₹3,500</option>
                  <option value="Yearly">Yearly Elite — ₹25,000</option>
                </select>
                <button onClick={handleAdd} className="h-10 w-full rounded-lg bg-gold text-gold-foreground font-semibold hover:opacity-90">Add Member</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selected && (() => {
        const live = members.find((m) => m.id === selected.id);
        return live ? <MemberProfileModal member={live} onClose={() => setSelected(null)} editable /> : null;
      })()}
    </DashboardLayout>
  );
}
