import { ArrowUpRight } from "lucide-react";
import bundleImg from "@/assets/cat-foundation.jpg";
import circleImg from "@/assets/cat-beverages.jpg";
import authImg from "@/assets/cat-capsules.jpg";

const promos = [
  { title: "Bundle & save", sub: "Daily Foundation + Omega + D3·K2", tag: "Save 15%", image: bundleImg, overlay: "from-primary/90 via-primary/70 to-primary/40" },
  { title: "Nutrix Circle", sub: "1 point per ₹1. Members-only drops.", tag: "Join free", image: circleImg, overlay: "from-forest/90 via-forest/65 to-forest/30" },
  { title: "Authenticate", sub: "Verify your batch on the lab portal.", tag: "Open portal", image: authImg, overlay: "from-primary/85 via-primary/60 to-primary/20" },
];

export const PromoGrid = () => (
  <section className="py-10 md:py-14 bg-background">
    <div className="container-tight grid md:grid-cols-3 gap-5">
      {promos.map((p, i) => (
        <a
          key={p.title}
          href="#"
          className="group relative text-primary-foreground rounded-2xl p-7 overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 animate-fade-up min-h-[180px]"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <img
            src={p.image}
            alt={p.title}
            width={800}
            height={800}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${p.overlay}`} />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{p.tag}</div>
            <h3 className="font-serif text-2xl md:text-3xl mt-3 leading-tight">{p.title}</h3>
            <p className="mt-2 text-sm opacity-85">{p.sub}</p>
          </div>
          <ArrowUpRight className="absolute bottom-6 right-6 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
      ))}
    </div>
  </section>
);
