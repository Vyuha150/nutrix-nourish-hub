import { Link } from "react-router-dom";
import foundation from "@/assets/cat-foundation.jpg";
import boosters from "@/assets/cat-boosters.jpg";
import snacks from "@/assets/cat-snacks.jpg";
import beverages from "@/assets/cat-beverages.jpg";
import capsules from "@/assets/cat-capsules.jpg";
import pastes from "@/assets/cat-pastes.jpg";

const cats = [
  { name: "Daily Foundation", count: 5, image: foundation },
  { name: "Meal Boosters", count: 7, image: boosters },
  { name: "Snacks", count: 7, image: snacks },
  { name: "Beverages", count: 4, image: beverages },
  { name: "Capsules", count: 5, image: capsules },
  { name: "Toppings", count: 5, image: pastes },
];

export const CategoryStrip = () => (
  <section className="py-14 bg-background border-y border-border">
    <div className="container-tight">
      <p className="label-eyebrow mb-6 text-center">Shop by category</p>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {cats.map((c, i) => (
          <Link
            key={c.name}
            to={`/shop?category=${encodeURIComponent(c.name)}`}
            className="group flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-dew/60 transition-colors animate-fade-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-soft group-hover:shadow-glow group-hover:scale-105 transition-all duration-500 ring-2 ring-mist/60 group-hover:ring-leaf">
              <img
                src={c.image}
                alt={c.name}
                width={800}
                height={800}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary leading-tight">{c.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{c.count} items</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        {[
          { to: "/offers", label: "Hot offers" },
          { to: "/goals", label: "Shop by goal" },
        ].map((b, i) => (
          <Link
            key={b.to}
            to={b.to}
            className="group relative inline-flex items-center justify-center px-8 h-12 rounded-full text-xs font-semibold uppercase tracking-[0.18em] text-primary overflow-hidden isolate animate-fade-up"
            style={{ animationDelay: `${0.4 + i * 0.08}s` }}
          >
            <span className="absolute inset-0 rounded-full bg-leaf/10 backdrop-blur-sm mix-blend-multiply transition-all duration-700 group-hover:bg-leaf/30 group-hover:scale-110" />
            <span className="absolute inset-0 rounded-full ring-1 ring-leaf/40 group-hover:ring-leaf transition-all duration-500" />
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-leaf/0 via-leaf/40 to-leaf/0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <span className="relative z-10 transition-all duration-500 group-hover:tracking-[0.22em]">
              {b.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
