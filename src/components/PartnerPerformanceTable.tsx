const partners = [
  { name: "The Vault", sales: "₹4,85,000", profit: "₹1,45,500", clubShare: "₹72,750", status: "Active" },
  { name: "Sky Lounge", sales: "₹3,42,000", profit: "₹1,02,600", clubShare: "₹51,300", status: "Active" },
  { name: "Noir Bar", sales: "₹2,98,000", profit: "₹89,400", clubShare: "₹44,700", status: "Active" },
  { name: "Amber Club", sales: "₹2,15,000", profit: "₹64,500", clubShare: "₹32,250", status: "Inactive" },
  { name: "Eclipse", sales: "₹1,76,000", profit: "₹52,800", clubShare: "₹26,400", status: "Active" },
];

export function PartnerPerformanceTable() {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Partner Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left font-medium text-muted-foreground">Partner Name</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Total Sales</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Profit</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Club Share</th>
              <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="py-3 font-medium text-foreground">{p.name}</td>
                <td className="py-3 text-right text-foreground">{p.sales}</td>
                <td className="py-3 text-right text-gold">{p.profit}</td>
                <td className="py-3 text-right text-foreground">{p.clubShare}</td>
                <td className="py-3 text-center">
                  <span className={p.status === "Active" ? "status-active" : "status-inactive"}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
