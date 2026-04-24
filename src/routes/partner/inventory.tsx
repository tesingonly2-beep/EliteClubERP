import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore, formatINR, type InventoryItem } from "@/lib/store";
import { Package, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/partner/inventory")({
  component: InventoryPage,
  head: () => ({ meta: [{ title: "Inventory — Elite Club" }] }),
});

interface Draft {
  name: string;
  barcode: string;
  category: string;
  mrp: string;
  cost: string;
  stock: string;
}

const empty: Draft = { name: "", barcode: "", category: "Whiskey", mrp: "", cost: "", stock: "0" };

function InventoryPage() {
  const { user } = useAuth();
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useStore();
  const partnerId = user?.partnerId ?? "";

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);

  const items = inventory
    .filter((i) => i.partnerId === partnerId)
    .filter(
      (i) =>
        !search ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.barcode.includes(search) ||
        i.category.toLowerCase().includes(search.toLowerCase()),
    );

  const openNew = () => {
    setEditing(null);
    setDraft(empty);
    setOpen(true);
  };

  const openEdit = (i: InventoryItem) => {
    setEditing(i);
    setDraft({
      name: i.name,
      barcode: i.barcode,
      category: i.category,
      mrp: String(i.mrp),
      cost: String(i.cost),
      stock: String(i.stock),
    });
    setOpen(true);
  };

  const save = () => {
    const mrp = Number(draft.mrp);
    const cost = Number(draft.cost);
    const stock = Number(draft.stock);
    if (!draft.name || !draft.barcode || !mrp || cost < 0) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    if (editing) {
      updateInventoryItem(editing.id, {
        name: draft.name,
        barcode: draft.barcode,
        category: draft.category,
        mrp,
        cost,
        stock,
      });
      toast.success("Item updated");
    } else {
      addInventoryItem({
        partnerId,
        name: draft.name,
        barcode: draft.barcode,
        category: draft.category,
        mrp,
        cost,
        stock,
      });
      toast.success("Item added to inventory");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this inventory item?")) return;
    deleteInventoryItem(id);
    toast.success("Item deleted");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your alcohol & food catalog. Used for both scanner and manual billing.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 h-10 rounded-lg bg-gold px-4 text-sm font-semibold text-gold-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>

        <div className="glass-panel p-5 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, barcode, category…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 px-2">Item</th>
                  <th className="py-3 px-2">Barcode</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2 text-right">MRP</th>
                  <th className="py-3 px-2 text-right">Cost</th>
                  <th className="py-3 px-2 text-right">Stock</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-12">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No inventory items yet
                    </td>
                  </tr>
                )}
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-border/40 hover:bg-accent/30">
                    <td className="py-3 px-2 font-medium text-foreground">{i.name}</td>
                    <td className="py-3 px-2 text-xs text-muted-foreground font-mono">{i.barcode}</td>
                    <td className="py-3 px-2">
                      <span className="rounded-md bg-gold-muted text-gold text-xs px-2 py-0.5">{i.category}</span>
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">{formatINR(i.mrp)}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{formatINR(i.cost)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={i.stock < 5 ? "text-destructive font-semibold" : i.stock >= 999 ? "text-muted-foreground" : "text-foreground"}>
                        {i.stock >= 999 ? "∞" : i.stock}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(i)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(i.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="glass-panel w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">{editing ? "Edit Item" : "Add Item"}</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Name *">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="field" />
              </Field>
              <Field label="Barcode *">
                <input value={draft.barcode} onChange={(e) => setDraft({ ...draft, barcode: e.target.value })} className="field font-mono" />
              </Field>
              <Field label="Category">
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="field">
                  {["Whiskey", "Vodka", "Gin", "Rum", "Beer", "Wine", "Cocktail", "Food", "Other"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="MRP (₹) *">
                  <input type="number" value={draft.mrp} onChange={(e) => setDraft({ ...draft, mrp: e.target.value })} className="field" />
                </Field>
                <Field label="Cost (₹) *">
                  <input type="number" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} className="field" />
                </Field>
                <Field label="Stock">
                  <input type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} className="field" />
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-accent">Cancel</button>
              <button onClick={save} className="h-9 px-4 rounded-lg bg-gold text-gold-foreground text-sm font-semibold hover:opacity-90">
                {editing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
