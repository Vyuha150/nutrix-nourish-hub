const categories = [
  {
    name: "Daily Foundation",
    desc: "The non-negotiable base — what every adult needs, every day.",
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
    items: [
      "Seed butter blend (sunflower + pumpkin)",
      "Nutritional yeast sprinkle",
      "Superfood jam (amla + fig)",
      "Protein-rich chutney powder",
      "Calcium-fortified til paste",
    ],
  },
];

export const Products = () => (
  <section id="products" className="py-24 md:py-32 bg-dew/40">
    <div className="container-tight">
      <div className="max-w-3xl mb-16">
        <div className="label-eyebrow mb-5">The product universe</div>
        <h2 className="font-serif text-4xl md:text-5xl text-primary leading-[1.05]">
          Six categories. <em className="font-light">One coherent system.</em>
        </h2>
        <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
          Conventional consumables only — powders, softgels, tablets, capsules, foods and toppings.
          Nothing you'll struggle to fit into your day.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {categories.map((c, i) => (
          <article key={c.name} className="group rounded-2xl border border-border bg-card p-7 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-serif text-2xl text-primary">{c.name}</h3>
              <span className="font-serif text-sm text-leaf">0{i + 1}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{c.desc}</p>
            <ul className="flex flex-wrap gap-2">
              {c.items.map((item) => (
                <li key={item} className="text-xs px-3 py-1.5 rounded-full border border-mist bg-dew/60 text-forest">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </section>
);
