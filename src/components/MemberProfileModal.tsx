import { useEffect, useRef, useState } from "react";
import {
  X, Camera, Save, Edit3, Phone, Mail, MapPin, Briefcase, Wine, Cake,
  CalendarDays, TrendingUp, Wallet, Receipt, Sparkles, User as UserIcon,
} from "lucide-react";
import { useStore, isExpired, daysUntil, formatINR, type Member, type Gender, type Plan } from "@/lib/store";
import { toast } from "sonner";

interface Props {
  member: Member;
  onClose: () => void;
  /** When true, the partner can edit profile fields. Admin/partner both true here. */
  editable?: boolean;
}

export function MemberProfileModal({ member, onClose, editable = true }: Props) {
  const { updateMember, transactions } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Member>(member);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync if member object updates externally
  useEffect(() => setDraft(member), [member]);

  const memberTxns = transactions.filter((t) => t.memberId === member.id);
  const lastVisit = memberTxns[0]?.createdAt;
  const expired = isExpired(member.expiry);
  const daysLeft = daysUntil(member.expiry);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft({ ...draft, photo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const save = () => {
    updateMember(member.id, draft);
    setEditing(false);
    toast.success("Profile updated");
  };

  const cancel = () => {
    setDraft(member);
    setEditing(false);
  };

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card shadow-2xl gold-glow animate-in zoom-in-95 duration-200"
      >
        {/* Hero band */}
        <div className="relative h-36 bg-gradient-to-br from-gold/40 via-gold/15 to-transparent overflow-hidden">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_50%,oklch(0.78_0.12_75/0.5),transparent_60%)]" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {editable && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg bg-background/70 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground border border-border hover:border-gold transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg bg-background/70 backdrop-blur p-1.5 text-muted-foreground hover:text-foreground border border-border"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold border border-gold/30">
            <Sparkles className="h-3 w-3" /> Elite Member
          </div>
        </div>

        {/* Profile body */}
        <div className="px-6 sm:px-8 pb-8 -mt-16">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-32 w-32 rounded-2xl border-4 border-card bg-gradient-to-br from-gold/30 to-gold/5 overflow-hidden flex items-center justify-center text-4xl font-display font-bold text-gold">
                {draft.photo ? (
                  <img src={draft.photo} alt={draft.name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {editing && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-gold text-gold-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    title="Change photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pt-16 sm:pt-20">
              {editing ? (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="font-display text-3xl font-bold bg-transparent border-b border-gold/40 focus:border-gold outline-none w-full"
                />
              ) : (
                <h2 className="font-display text-3xl font-bold text-foreground truncate">{member.name}</h2>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  member.plan === "Yearly" ? "bg-gold text-gold-foreground" : "bg-gold-muted text-gold"
                }`}>
                  {member.plan} Pass
                </span>
                <span className={expired ? "status-inactive" : "status-active"}>
                  {expired ? "Expired" : `${daysLeft}d left`}
                </span>
                <span className="text-xs text-muted-foreground">
                  Member since {new Date(member.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat icon={<Wallet className="h-4 w-4" />} label="Total Spent" value={formatINR(member.totalSpent)} highlight />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Visits" value={String(member.visits)} />
            <Stat icon={<Receipt className="h-4 w-4" />} label="Receipts" value={String(memberTxns.length)} />
            <Stat icon={<CalendarDays className="h-4 w-4" />} label="Last Visit" value={lastVisit ? new Date(lastVisit).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"} />
          </div>

          {/* Detail grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <Field icon={<Phone className="h-4 w-4" />} label="Phone" value={draft.phone} editing={editing}
              onChange={(v) => setDraft({ ...draft, phone: v })} />
            <Field icon={<Mail className="h-4 w-4" />} label="Email" value={draft.email ?? ""} editing={editing}
              onChange={(v) => setDraft({ ...draft, email: v })} />
            <Field icon={<UserIcon className="h-4 w-4" />} label="Age" value={draft.age?.toString() ?? ""} editing={editing}
              type="number" onChange={(v) => setDraft({ ...draft, age: v ? parseInt(v) : undefined })} />
            <Field icon={<UserIcon className="h-4 w-4" />} label="Gender" value={draft.gender ?? ""} editing={editing}
              select={["Male", "Female", "Other"]} onChange={(v) => setDraft({ ...draft, gender: v as Gender })} />
            <Field icon={<Cake className="h-4 w-4" />} label="Date of Birth" value={draft.dob ?? ""} editing={editing}
              type="date" onChange={(v) => setDraft({ ...draft, dob: v })} />
            <Field icon={<Briefcase className="h-4 w-4" />} label="Occupation" value={draft.occupation ?? ""} editing={editing}
              onChange={(v) => setDraft({ ...draft, occupation: v })} />
            <Field icon={<MapPin className="h-4 w-4" />} label="Address" value={draft.address ?? ""} editing={editing}
              onChange={(v) => setDraft({ ...draft, address: v })} />
            <Field icon={<MapPin className="h-4 w-4" />} label="City" value={draft.city ?? ""} editing={editing}
              onChange={(v) => setDraft({ ...draft, city: v })} />
            <Field icon={<Wine className="h-4 w-4" />} label="Preferred Drink" value={draft.preferredDrink ?? ""} editing={editing}
              onChange={(v) => setDraft({ ...draft, preferredDrink: v })} />
            <Field icon={<CalendarDays className="h-4 w-4" />} label="Plan" value={draft.plan} editing={editing}
              select={["Daily", "Octa", "Yearly"]} onChange={(v) => setDraft({ ...draft, plan: v as Plan })} />
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Concierge Notes</label>
            {editing ? (
              <textarea
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                rows={3}
                placeholder="Preferences, allergies, VIP notes…"
                className="mt-1.5 w-full rounded-lg border border-input bg-background p-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
              />
            ) : (
              <p className="mt-1.5 rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-foreground italic min-h-[3rem]">
                {member.notes || <span className="text-muted-foreground not-italic">No notes yet.</span>}
              </p>
            )}
          </div>

          {/* Recent transactions */}
          {memberTxns.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Recent Activity</p>
              <div className="rounded-lg border border-border/60 bg-background/40 divide-y divide-border/50 overflow-hidden">
                {memberTxns.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{t.partnerName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t.receiptNo} · {new Date(t.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className="font-semibold text-gold ml-3">{formatINR(t.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {editing && (
            <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-border">
              <button onClick={cancel} className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-accent">
                Cancel
              </button>
              <button onClick={save} className="h-10 px-5 rounded-lg bg-gold text-gold-foreground text-sm font-semibold hover:opacity-90 flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-gold/40 bg-gold-muted" : "border-border bg-background/40"}`}>
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${highlight ? "text-gold" : "text-muted-foreground"}`}>
        {icon} {label}
      </div>
      <p className={`mt-1 text-lg font-display font-bold ${highlight ? "text-gold" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function Field({
  icon, label, value, editing, onChange, type = "text", select,
}: {
  icon: React.ReactNode; label: string; value: string; editing: boolean;
  onChange: (v: string) => void; type?: string; select?: string[];
}) {
  return (
    <div className="py-2 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      {editing ? (
        select ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none text-sm py-1"
          >
            <option value="">—</option>
            {select.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none text-sm py-1"
          />
        )
      ) : (
        <p className="mt-1 text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</p>
      )}
    </div>
  );
}
