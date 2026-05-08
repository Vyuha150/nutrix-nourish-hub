import { ArrowUpRight } from "lucide-react";

const promos = [
  { title: "Bundle & save", sub: "Daily Foundation + Omega + D3·K2", tag: "Save 15%", bg: "bg-gradient-forest", fg: "text-primary-foreground" },
  { title: "Nutrix Circle", sub: "1 point per ₹1. Members-only drops.", tag: "Join free", bg: "bg-leaf", fg: "text-leaf-foreground" },
  { title: "Authenticate", sub: "Verify your batch on the lab portal.", tag: "Open portal", bg: "bg-mist", fg: "text-mist-foreground" },
];

export const PromoGrid = () => (
  <section className="py-10 md:py-14 bg-background">
    <div className="container-tight grid md:grid-cols-3 gap-5">
      {promos.map((p, i) => (
        <a
          key={p.title}
          href="#"
          className={`group relative ${p.bg} ${p.fg} rounded-2xl p-7 overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 animate-fade-up`}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-current opacity-[0.07] group-hover:scale-125 transition-transform duration-700" />
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{p.tag}</div>
          <h3 className="font-serif text-2xl md:text-3xl mt-3 leading-tight">{p.title}</h3>
          <p className="mt-2 text-sm opacity-80">{p.sub}</p>
          <ArrowUpRight className="absolute bottom-6 right-6 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
      ))}
    </div>
  </section>
);
