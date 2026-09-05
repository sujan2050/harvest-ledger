import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, TicketCheck, UserRoundPlus, Sprout } from "lucide-react";
import { useAuth, homeForRole } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiSetu — Procurement & Queue Management" },
      {
        name: "description",
        content:
          "Sign in to generate procurement tokens, run the queue desk, or administer centres and crop types.",
      },
      { property: "og:title", content: "KrishiSetu — Procurement & Queue Management" },
      {
        property: "og:description",
        content: "Token queues, procurement records and centre administration in one place.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const destination = user ? homeForRole(user.role) : "/login";

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link to="/" className="flex items-center gap-2.5 text-primary">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Sprout size={20} /></span>
            <span className="font-display text-xl font-semibold">KrishiSetu</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link to="/display" className="hidden text-sm font-medium text-muted-foreground hover:text-primary sm:block">Live queue</Link>
            <Link to={destination} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:scale-[1.02] hover:bg-primary-hover hover:shadow-button">
              {user ? "Open dashboard" : "Sign in"}<ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </header>

      <section className="contour-pattern relative overflow-hidden border-b border-border">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center px-6 py-20 lg:grid-cols-[1fr_0.72fr] lg:gap-16">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <span className="size-2 rounded-full bg-secondary" /> Agricultural procurement, made transparent
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-[1.04] font-semibold text-foreground sm:text-6xl lg:text-7xl">
              Fair queues. Fair prices. Every farmer served.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              One dependable system for farmers, procurement teams, and administrators to move every harvest forward with clarity.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={destination} className="inline-flex items-center gap-2 rounded-md bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-[0_10px_24px_rgba(201,132,60,0.2)] transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_14px_30px_rgba(201,132,60,0.28)]">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/display" className="inline-flex items-center rounded-md border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-card-hover">View live queue</Link>
            </div>
          </div>
          <div className="relative mt-14 hidden min-h-[390px] lg:block" aria-hidden="true">
            <div className="absolute inset-x-8 top-6 h-72 rotate-2 border border-border bg-card shadow-[0_30px_70px_rgba(28,25,23,0.12)]">
              <div className="border-b border-border bg-primary px-6 py-4 text-xs font-semibold text-primary-foreground">PROCUREMENT RECEIPT · VERIFIED</div>
              <div className="p-8">
                <p className="text-xs text-muted-foreground uppercase">Now serving</p>
                <p className="mt-2 font-mono text-7xl font-bold text-primary">A-042</p>
                <div className="my-7 border-t border-dashed border-border" />
                <div className="grid grid-cols-3 gap-4 text-xs"><span>Wheat</span><span>250 kg</span><span>Center 04</span></div>
              </div>
            </div>
            <div className="absolute right-0 bottom-5 w-56 -rotate-3 border border-border bg-muted p-5 shadow-card-hover">
              <div className="grid grid-cols-5 gap-1 opacity-50">{Array.from({ length: 25 }).map((_, i) => <span key={i} className={i % 3 ? "size-2 bg-primary" : "size-2"} />)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl divide-y divide-border px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[{ value: "500+", label: "Farmers connected" }, { value: "12", label: "Procurement centers" }, { value: "Zero", label: "Wait confusion" }].map((stat) => (
            <div key={stat.label} className="px-6 py-9 text-center"><p className="font-display text-4xl font-semibold text-primary">{stat.value}</p><p className="mt-1 text-sm text-muted-foreground">{stat.label}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-xl"><p className="text-xs font-semibold text-secondary uppercase">A clear path to procurement</p><h2 className="mt-3 font-display text-4xl font-semibold">How it works</h2></div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[{ icon: UserRoundPlus, n: "01", title: "Register", text: "Create a secure profile with your farmer and payment details." }, { icon: TicketCheck, n: "02", title: "Generate Token", text: "Choose a center, crop, and quantity to join the live queue." }, { icon: ClipboardCheck, n: "03", title: "Get Procured", text: "Follow your status and complete procurement at the counter." }].map(({ icon: Icon, n, title, text }) => (
            <article key={title} className="card-surface card-interactive relative p-7">
              <span className="absolute right-6 top-5 font-mono text-xs text-muted-foreground">{n}</span>
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Icon size={22} /></div>
              <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
