import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { useStore, isExpired, type Member, type Plan, PLAN_DAYS } from "@/lib/store";
import { Search, Eye, Plus, X, UserPlus } from "lucide-react";
import { MemberProfileModal } from "@/components/MemberProfileModal";
import { toast } from "sonner";

export const Route = createFileRoute("/partner/members")({
  component: PartnerMembersPage,
  head: () => ({ meta: [{ title: "Members — Elite Club" }] }),
});

function PartnerMembersPage() {
  const { members, addMember } = useStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      (m.city ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  // Always-fresh selected member (so edits reflect live)
  const liveSelected = selected ? members.find((m) => m.id === selected.id) ?? null : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Members</h1>
            <p className="text-sm text-muted-foreground mt-1">Browse, view & manage club members.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90 shadow-lg gold-glow"
          >
            <UserPlus className="h-4 w-4" /> Add Member
          </button>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or city…"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="glass-panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Phone</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Expiry</th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const exp = isExpired(m.expiry);
                  const initials = m.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gold-muted overflow-hidden flex items-center justify-center text-xs font-bold text-gold shrink-0">
                            {m.photo ? (
                              <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{m.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.city ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{m.phone}</td>
                      <td className="py-3">
                        <span className="rounded-md bg-gold-muted px-2 py-0.5 text-xs font-medium text-gold">{m.plan}</span>
                      </td>
                      <td className="py-3 text-foreground">{new Date(m.expiry).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 text-center">
                        <span className={exp ? "status-inactive" : "status-active"}>{exp ? "Expired" : "Active"}</span>
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
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No members found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {liveSelected && (
        <MemberProfileModal member={liveSelected} onClose={() => setSelected(null)} editable />
      )}

      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onAdd={(payload) => {
            const days = PLAN_DAYS[payload.plan];
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + days);
            addMember({ ...payload, expiry: expiry.toISOString() });
            toast.success(`${payload.name} added to the club`);
            setShowAdd(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function AddMemberModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (m: Omit<Member, "id" | "joinedAt" | "totalSpent" | "visits" | "expiry">) => void;
}) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", plan: "Daily" as Plan,
    age: "", gender: "" as "" | Member["gender"], city: "", occupation: "", preferredDrink: "", photo: "",
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    onAdd({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      plan: form.plan,
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
      city: form.city.trim() || undefined,
      occupation: form.occupation.trim() || undefined,
      preferredDrink: form.preferredDrink.trim() || undefined,
      photo: form.photo || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card shadow-2xl gold-glow animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gold-muted flex items-center justify-center">
              <Plus className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Add New Member</h3>
              <p className="text-xs text-muted-foreground">Create an Elite Club profile</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div className="h-20 w-20 rounded-2xl bg-gold-muted border-2 border-dashed border-gold/40 overflow-hidden flex items-center justify-center text-gold hover:border-gold transition-colors">
                {form.photo ? (
                  <img src={form.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Plus className="h-6 w-6" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            <div>
              <p className="text-sm font-medium text-foreground">Profile Photo</p>
              <p className="text-xs text-muted-foreground">Optional — click to upload</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Full Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Rahul Sharma" />
            <Input label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98765 43210" />
            <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="rahul@email.com" />
            <Input label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} placeholder="28" type="number" />
            <Select label="Gender" value={form.gender ?? ""} onChange={(v) => setForm({ ...form, gender: v as Member["gender"] })} options={["Male", "Female", "Other"]} />
            <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Mumbai" />
            <Input label="Occupation" value={form.occupation} onChange={(v) => setForm({ ...form, occupation: v })} placeholder="Entrepreneur" />
            <Input label="Preferred Drink" value={form.preferredDrink} onChange={(v) => setForm({ ...form, preferredDrink: v })} placeholder="Single Malt" />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Membership Plan</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["Daily", "Octa", "Yearly"] as Plan[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, plan: p })}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    form.plan === p
                      ? "border-gold bg-gold-muted shadow-md"
                      : "border-border bg-background/50 hover:border-gold/40"
                  }`}
                >
                  <p className="font-display font-bold text-sm text-foreground">{p}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {p === "Daily" ? "1 day · ₹500" : p === "Octa" ? "8 days · ₹3,500" : "365 days · ₹25,000"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-accent">Cancel</button>
            <button onClick={submit} className="h-10 px-5 rounded-lg bg-gold text-gold-foreground text-sm font-semibold hover:opacity-90 flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
