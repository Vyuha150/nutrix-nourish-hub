import { Sparkles, ChefHat, Cookie, GlassWater, Pill, Soup, ArrowUpRight } from "lucide-react";
import foundation from "@/assets/cat-foundation.jpg";
import boosters from "@/assets/cat-boosters.jpg";
import snacks from "@/assets/cat-snacks.jpg";
import beverages from "@/assets/cat-beverages.jpg";
import capsules from "@/assets/cat-capsules.jpg";
import pastes from "@/assets/cat-pastes.jpg";

const categories = [
  {
    name: "Daily Foundation",
    desc: "The non-negotiable base — what every adult needs, every day.",
    image: foundation,
    icon: Sparkles,
    forms: ["Powder", "Softgel", "Tablet"],
    actives: 18,
    items: [
      "Complete daily powder (30-in-1 micronutrient)",
      "Vitamin D3 + K2 daily tablet",
      "Omega-3 softgel (algae-derived)",
      "Immunity base powder",
      "Gut health prebiotic powder",
    ],
  },
  {
    name: "Meal Boosters",
    desc: "Slot into the foods you already cook. Zero behavior change.",
    image: boosters,
    icon: ChefHat,
    forms: ["Powder", "Premix", "Flour"],
    actives: 12,
    items: [
      "Protein topper for rice & dal",
      "Fortified wheat flour blend",
      "Nutrient-dense atta premix",
      "Spirulina + moringa shake powder",
      "High-protein dosa premix",
      "Millet multi-grain blend",
      "Iron-rich ragi powder",
    ],
  },
  {
    name: "Snacks & Ready-to-Eat",
    desc: "Functional nutrition that actually tastes like a snack.",
    image: snacks,
    icon: Cookie,
    forms: ["Bar", "Mix", "Bite"],
    actives: 9,
    items: [
      "Fortified chikki (jaggery + seed bar)",
      "Baked makhana packs",
      "Protein muesli bar",
      "Multigrain cracker pack",
      "Roasted seed trail mix",
      "Fortified poha ready-mix",
      "Nutritional biscuits (iron / calcium)",
    ],
  },
  {
    name: "Beverages",
    desc: "Hydration with a job to do.",
    image: beverages,
    icon: GlassWater,
    forms: ["Powder", "Premix"],
    actives: 7,
    items: [
      "Green tea + ashwagandha blend",
      "Turmeric latte premix",
      "Protein lassi powder",
      "Daily greens drink powder",
    ],
  },
  {
    name: "Functional Capsules & Tablets",
    desc: "Targeted actives where dosing precision matters.",
    image: capsules,
    icon: Pill,
    forms: ["Tablet", "Softgel", "Capsule"],
    actives: 14,
    items: [
      "Multivitamin tablet (adults & kids)",
      "Sleep support melatonin softgel",
      "Zinc + Vitamin C immunity tablet",
      "Hair-skin-nails biotin tablet",
      "Digestive enzyme capsule",
    ],
  },
  {
    name: "Pastes, Toppings & Condiments",
    desc: "Built into Indian flavor formats. Not bolted on.",
    image: pastes,
    icon: Soup,
    forms: ["Jar", "Sprinkle", "Paste"],
    actives: 8,
    items: [
      "Seed butter blend (sunflower + pumpkin)",
      "Nutritional yeast sprinkle",
      "Superfood jam (amla + fig)",
      "Protein-rich chutney powder",
      "Calcium-fortified til paste",
    ],
  },
];

const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
const totalActives = categories.reduce((s, c) => s + c.actives, 0);

export const Products = () => (
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
            [`${totalActives}+`, "Actives"],
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
          <article
            key={c.name}
            className="group relative rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 animate-fade-up flex flex-col"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* Image header */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                width={800}
                height={500}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
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
                  <div className="font-serif text-2xl text-primary leading-none">{c.actives}</div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground mt-1">Actives</div>
                </div>
              </div>

              {/* Items list with bullets */}
              <ul className="mt-4 space-y-2 flex-1">
                {c.items.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-forest leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-leaf shrink-0" />
                    <span>{item}</span>
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
          </article>
        ))}
      </div>
    </div>
  </section>
);
