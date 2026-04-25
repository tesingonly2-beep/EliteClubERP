import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Crown, ArrowRight, Sparkles, MapPin, Wine, ShieldCheck, QrCode,
  Star, Check, Mail,
} from "lucide-react";
import { useAuth, rolePath } from "@/lib/auth";
import { useStore, formatINR, PLAN_PRICES } from "@/lib/store";
import heroImg from "@/assets/landing-hero.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Elite Club — India's Most Exclusive Bar Membership" },
      { name: "description", content: "One membership. Every premium bar in India. Become a founding Elite Club member today." },
      { property: "og:title", content: "Elite Club — Members-only access to India's finest venues" },
      { property: "og:description", content: "Curated bars. Concierge service. One membership card opens every door." },
    ],
  }),
});

function Landing() {
  const { user } = useAuth();
  const { partners } = useStore();

  const activePartners = partners.filter((p) => p.status === "Active");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/60 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gold flex items-center justify-center text-gold-foreground">
              <Crown className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-wide">Elite Club</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#venues" className="hover:text-foreground transition-colors">Venues</a>
            <a href="#plans" className="hover:text-foreground transition-colors">Plans</a>
            <a href="#partner" className="hover:text-foreground transition-colors">Partners</a>
          </nav>
          <Link
            to="/login"
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gold text-gold-foreground text-sm font-semibold hover:opacity-90"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="absolute -z-10 top-40 -left-20 h-96 w-96 rounded-full bg-gold/15 blur-[120px]" />
        <div className="absolute -z-10 bottom-0 -right-20 h-96 w-96 rounded-full bg-chart-4/15 blur-[120px]" />

        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-muted px-3 py-1 text-xs font-semibold text-gold uppercase tracking-[0.2em]"
          >
            <Sparkles className="h-3 w-3" /> Members Only · Est. 2025
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-display text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            One card. <span className="text-gold">Every premium bar.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Elite Club is India's first membership network for the country's finest bars and lounges.
            Skip the menus. Skip the bills. Just sip.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex items-center justify-center gap-3 flex-wrap"
          >
            <Link to="/login" className="group flex items-center gap-2 h-12 px-6 rounded-xl bg-gold text-gold-foreground font-semibold hover:opacity-90 shadow-2xl shadow-gold/30">
              Get Your Card <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#plans" className="flex items-center gap-2 h-12 px-6 rounded-xl border border-border bg-card/60 backdrop-blur text-foreground font-semibold hover:border-gold/60">
              View Plans
            </a>
          </motion.div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 max-w-2xl mx-auto gap-6 text-left sm:text-center">
            <Stat n={`${activePartners.length}+`} label="Premium Venues" />
            <Stat n="6" label="Cities" />
            <Stat n="24/7" label="Concierge" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker="How It Works" title="Three steps to access" />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: Crown, t: "Choose a plan", d: "Daily, 8-day Octa or Yearly. Instant activation." },
              { Icon: QrCode, t: "Get your card", d: "A digital QR card lives in your account, ready to scan." },
              { Icon: Wine, t: "Walk in. Order. Sip.", d: "Show your card at any partner venue. We handle the rest." },
            ].map(({ Icon, t, d }, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-7 hover:border-gold/60 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-gold-muted flex items-center justify-center text-gold mb-5 group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Step {i + 1}</p>
                <h3 className="font-display text-xl font-bold mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VENUES */}
      <section id="venues" className="py-24 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker="The Network" title="Where your card opens doors" />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activePartners.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-gold/60 transition-colors"
              >
                <div className="relative h-40 overflow-hidden bg-secondary">
                  {p.photo && <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  {p.rating !== undefined && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-[11px] font-semibold border border-gold/30">
                      <Star className="h-3 w-3 text-gold fill-gold" /> {p.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-display text-lg font-bold">{p.name}</h4>
                  {p.cuisine && <p className="text-[11px] uppercase tracking-wider text-gold font-semibold mt-0.5">{p.cuisine}</p>}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3" /> <span className="truncate">{p.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="py-24 border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading kicker="Membership" title="Pick the way you sip" />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {([
              { plan: "Daily", price: PLAN_PRICES.Daily, tag: "Try it out", perks: ["1 day full access", "All partner venues", "Concierge booking"], highlight: false },
              { plan: "Octa", price: PLAN_PRICES.Octa, tag: "Most popular", perks: ["8 days of access", "Priority reservations", "Welcome drink at every venue"], highlight: true },
              { plan: "Yearly", price: PLAN_PRICES.Yearly, tag: "Founder tier", perks: ["365 days unlimited", "Private event invitations", "Dedicated concierge line"], highlight: false },
            ] as const).map((p) => (
              <div
                key={p.plan}
                className={`relative rounded-2xl border p-7 transition-all ${
                  p.highlight ? "border-gold bg-gradient-to-b from-gold-muted to-card scale-[1.02] shadow-2xl shadow-gold/20" : "border-border bg-card hover:border-gold/40"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold text-gold-foreground text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">{p.tag}</p>
                <h3 className="font-display text-3xl font-bold mt-1">{p.plan}</h3>
                <p className="mt-4 font-display text-4xl font-bold">{formatINR(p.price)}</p>
                <ul className="mt-6 space-y-2.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-foreground/90">
                      <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" /> {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`mt-7 flex items-center justify-center gap-2 h-11 rounded-lg font-semibold transition-opacity ${
                    p.highlight ? "bg-gold text-gold-foreground hover:opacity-90" : "border border-border hover:border-gold/60"
                  }`}
                >
                  Get {p.plan}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER WITH US */}
      <section id="partner" className="py-24 border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold-muted via-card to-card p-10 sm:p-14 gold-glow">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-bold">For Bars & Lounges</p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">Become an Elite Partner.</h2>
                <p className="mt-3 text-muted-foreground">
                  Fill more seats. Earn instant settlements. Tap into India's most discerning drinkers.
                </p>
                <div className="mt-5 flex items-center gap-4 text-sm text-foreground/80">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold" /> 50/50 profit split</span>
                  <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-gold" /> Verified members</span>
                </div>
              </div>
              <Link
                to="/login"
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-gold text-gold-foreground font-semibold hover:opacity-90"
              >
                Apply to Partner <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gold flex items-center justify-center text-gold-foreground">
              <Crown className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-foreground">Elite Club</span>
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="mailto:hello@elite.club" className="hover:text-foreground transition-colors flex items-center gap-1.5"><Mail className="h-4 w-4" /> hello@elite.club</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold">{kicker}</p>
      <h2 className="mt-2 font-display text-4xl sm:text-5xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="border-l-2 border-gold/40 sm:border-l-0 sm:border-t-2 pl-4 sm:pl-0 sm:pt-3">
      <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">{n}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
