import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChefHat, Cookie, GlassWater, Pill, Soup, Sparkles } from "lucide-react";
import { useCommerce } from "./CommerceProvider";
import { resolveProductImage } from "@/lib/productMedia";

const categoryMeta: Record<string, { desc: string; icon: typeof Sparkles; forms: string[] }> = {
  "Daily Foundation": { desc: "The non-negotiable base — what every adult needs, every day.", icon: Sparkles, forms: ["Powder", "Softgel", "Tablet"] },
  "Meal Boosters": { desc: "Slot into the foods you already cook. Zero behavior change.", icon: ChefHat, forms: ["Powder", "Premix", "Flour"] },
  Snacks: { desc: "Functional nutrition that actually tastes like a snack.", icon: Cookie, forms: ["Bar", "Mix", "Bite"] },
  Beverages: { desc: "Hydration with a job to do.", icon: GlassWater, forms: ["Powder", "Premix"] },
  Capsules: { desc: "Targeted actives where dosing precision matters.", icon: Pill, forms: ["Tablet", "Softgel", "Capsule"] },
  Toppings: { desc: "Built into Indian flavor formats. Not bolted on.", icon: Soup, forms: ["Jar", "Sprinkle", "Paste"] },
};

export const Products = () => {
  const { products } = useCommerce();
  const categories = useMemo(() => {
    const grouped = new Map<string, typeof products>();
    products.forEach((product) => grouped.set(product.category, [...(grouped.get(product.category) ?? []), product]));
    return Array.from(grouped.entries()).map(([name, items]) => ({ name, items, ...(categoryMeta[name] ?? categoryMeta["Daily Foundation"]) }));
  }, [products]);

  const totalItems = products.length;
  const totalActives = categories.length;

  return (
  <section id="products" className="relative py-24 md:py-32 bg-dew/40 overflow-hidden">
    {/* futuristic grid backdrop */}
    <div
      className="absolute inset-0 opacity-[0.05] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    />
    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-leaf/15 blur-3xl animate-pulse-soft pointer-events-none" />
    <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-mist/40 blur-3xl animate-pulse-soft pointer-events-none" />

    <div className="container-tight relative">
      {/* Header */}
      <div className="grid md:grid-cols-12 gap-10 mb-16 items-end">
        <div className="md:col-span-7">
          <div className="label-eyebrow mb-5">The product universe</div>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-[1.05]">
            Six categories. <em className="font-light">One coherent system.</em>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-xl">
            Conventional consumables only — powders, softgels, tablets, capsules, foods and toppings.
            Nothing you'll struggle to fit into your day.
          </p>
        </div>
        {/* Infographic stat band */}
        <div className="md:col-span-5 grid grid-cols-3 gap-3">
          {[
            ["6", "Categories"],
            [`${totalItems}`, "Products"],
            [`${totalActives}+`, "Groups"],
          ].map(([n, l], i) => (
            <div
              key={l}
              className="relative rounded-2xl bg-card border border-border p-4 shadow-soft animate-fade-up overflow-hidden group"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-leaf opacity-20 group-hover:scale-150 group-hover:opacity-40 transition-all duration-700" />
              <div className="relative font-serif text-3xl text-primary">{n}</div>
              <div className="relative text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c, i) => (
          <Link
            key={c.name}
            to={`/shop?category=${encodeURIComponent(c.name)}`}
            className="group relative rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 animate-fade-up flex flex-col cursor-pointer"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* Image header */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={resolveProductImage(c.items[0] ?? { name: c.name, category: c.name, imageKey: "powder" })} alt={c.name} width={800} height={500} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
              {/* number */}
              <span className="absolute top-4 right-4 font-serif text-xs px-2.5 py-1 rounded-full bg-background/90 text-primary backdrop-blur">
                0{i + 1}
              </span>
              {/* icon chip */}
              <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-background/90 backdrop-blur flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              {/* title */}
              <div className="absolute inset-x-5 bottom-4 text-primary-foreground">
                <h3 className="font-serif text-2xl leading-tight drop-shadow-sm">{c.name}</h3>
              </div>
              {/* hover arrow */}
              <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-primary-foreground opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>

              {/* Mini infographic */}
              <div className="flex items-center gap-3 mt-4 pb-4 border-b border-border">
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-leaf font-semibold mb-1">Forms</div>
                  <div className="flex flex-wrap gap-1">
                    {c.forms.map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-mist/60 text-forest font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif text-2xl text-primary leading-none">{c.items.length}</div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground mt-1">Items</div>
                </div>
              </div>

              {/* Items list with bullets */}
              <ul className="mt-4 space-y-2 flex-1">
                  {c.items.slice(0, 4).map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-xs text-forest leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-leaf shrink-0" />
                      <span>{item.name}</span>
                  </li>
                ))}
                {c.items.length > 4 && (
                  <li className="text-[11px] text-leaf font-semibold uppercase tracking-wider pt-1">
                    +{c.items.length - 4} more
                  </li>
                )}
              </ul>

              {/* Animated bar */}
              <div className="mt-5 h-1 bg-mist/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-leaf rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
};
