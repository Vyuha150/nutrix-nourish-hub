type Row = {
  name: string;
  type: "Vitamin" | "Mineral" | "Macro" | "Other";
  solubility: "Fat" | "Water" | "—";
  bestForm: string;
  delivery: string;
  why: string;
};

const data: Row[] = [
  // Fat-soluble vitamins
  { name: "Vitamin A", type: "Vitamin", solubility: "Fat", bestForm: "Retinyl palmitate / beta-carotene",
    delivery: "Softgel (with meal fats)", why: "Pre-formed retinol is directly usable; carotenoid for low-toxicity baseline." },
  { name: "Vitamin D3", type: "Vitamin", solubility: "Fat", bestForm: "Cholecalciferol (D3) + K2 (MK-7)",
    delivery: "Softgel or oil-based tablet", why: "D3 raises serum 25-OH-D more efficiently than D2; pair with K2 for calcium routing." },
  { name: "Vitamin E", type: "Vitamin", solubility: "Fat", bestForm: "Mixed natural tocopherols (d-α)",
    delivery: "Softgel", why: "Natural d-α tocopherol has ~2× the bioactivity of synthetic dl-α." },
  { name: "Vitamin K2", type: "Vitamin", solubility: "Fat", bestForm: "Menaquinone-7 (MK-7)",
    delivery: "Softgel", why: "MK-7's long half-life (~3 days) gives steady tissue saturation." },
  // Water-soluble
  { name: "Vitamin C", type: "Vitamin", solubility: "Water", bestForm: "Liposomal or buffered ascorbate",
    delivery: "Powder or tablet (split doses)", why: "Saturable transport — small frequent doses absorb better than one mega-dose." },
  { name: "Vitamin B1 (Thiamine)", type: "Vitamin", solubility: "Water", bestForm: "Benfotiamine",
    delivery: "Tablet or capsule", why: "Fat-soluble B1 derivative with markedly higher tissue penetration." },
  { name: "Vitamin B2 (Riboflavin)", type: "Vitamin", solubility: "Water", bestForm: "Riboflavin-5-phosphate",
    delivery: "Tablet or capsule", why: "Active coenzyme form — no liver activation step required." },
  { name: "Vitamin B3 (Niacin)", type: "Vitamin", solubility: "Water", bestForm: "Nicotinamide / NMN",
    delivery: "Tablet", why: "Nicotinamide avoids the flush; supports NAD+ pathways." },
  { name: "Vitamin B6", type: "Vitamin", solubility: "Water", bestForm: "Pyridoxal-5-phosphate (P5P)",
    delivery: "Tablet", why: "Active form; avoids neuropathy risk linked to high-dose pyridoxine HCl." },
  { name: "Vitamin B9 (Folate)", type: "Vitamin", solubility: "Water", bestForm: "L-methylfolate (5-MTHF)",
    delivery: "Tablet or capsule", why: "Bypasses MTHFR enzyme variants; immediately usable by cells." },
  { name: "Vitamin B12", type: "Vitamin", solubility: "Water", bestForm: "Methylcobalamin / adenosylcobalamin",
    delivery: "Sublingual tablet", why: "Active coenzyme forms; sublingual route bypasses gut absorption issues." },
  { name: "Biotin (B7)", type: "Vitamin", solubility: "Water", bestForm: "D-biotin",
    delivery: "Tablet or capsule", why: "Naturally occurring isomer; the only form with biological activity." },
  // Minerals
  { name: "Iron", type: "Mineral", solubility: "Water", bestForm: "Ferrous bisglycinate",
    delivery: "Tablet (away from tea/coffee)", why: "Chelated form: ~3× absorption of sulfate, far less GI distress." },
  { name: "Calcium", type: "Mineral", solubility: "Water", bestForm: "Calcium citrate-malate",
    delivery: "Tablet (split, with meals)", why: "Absorbed without strong stomach acid; better than carbonate for most adults." },
  { name: "Magnesium", type: "Mineral", solubility: "Water", bestForm: "Glycinate (calm) / citrate (motility)",
    delivery: "Capsule or powder", why: "Glycinate is gentle and bioavailable; avoid oxide (~4% absorbed)." },
  { name: "Zinc", type: "Mineral", solubility: "Water", bestForm: "Zinc picolinate or bisglycinate",
    delivery: "Tablet (away from iron/calcium)", why: "Chelated forms outperform oxide and sulfate in absorption studies." },
  { name: "Selenium", type: "Mineral", solubility: "Water", bestForm: "Selenomethionine",
    delivery: "Capsule", why: "Organic form integrates into proteins; safer therapeutic window than selenite." },
  { name: "Iodine", type: "Mineral", solubility: "Water", bestForm: "Potassium iodide",
    delivery: "Tablet", why: "Stable, well-studied form for thyroid hormone synthesis." },
  { name: "Chromium", type: "Mineral", solubility: "Water", bestForm: "Chromium picolinate",
    delivery: "Capsule", why: "Best-absorbed form for glycemic-support clinical evidence." },
  // Macros & others
  { name: "Protein", type: "Macro", solubility: "—", bestForm: "Whey isolate / pea-rice blend",
    delivery: "Powder (post-meal or post-workout)", why: "Complete amino acid profile; ~1.6 g/kg/day for active adults." },
  { name: "Omega-3 (EPA/DHA)", type: "Macro", solubility: "Fat", bestForm: "Triglyceride or algal oil",
    delivery: "Softgel (with meal)", why: "TG-form absorbs ~70% better than ethyl esters; algal is vegan & contaminant-free." },
  { name: "Fiber (prebiotic)", type: "Macro", solubility: "Water", bestForm: "PHGG / inulin / resistant starch",
    delivery: "Powder (mixed in food/drink)", why: "Selectively feeds beneficial gut microbes; gentler than psyllium for daily use." },
  { name: "Choline", type: "Other", solubility: "Water", bestForm: "Alpha-GPC or citicoline",
    delivery: "Capsule", why: "Crosses the blood-brain barrier; superior to bitartrate for cognitive support." },
  { name: "Coenzyme Q10", type: "Other", solubility: "Fat", bestForm: "Ubiquinol",
    delivery: "Softgel (with fats)", why: "Reduced, body-ready form; far better absorbed in adults over 40." },
  { name: "Curcumin", type: "Other", solubility: "Fat", bestForm: "Curcumin + piperine or phytosome",
    delivery: "Capsule (with meal)", why: "Plain curcumin is poorly absorbed; piperine boosts bioavailability ~20×." },
  { name: "Probiotics", type: "Other", solubility: "—", bestForm: "Multi-strain, ≥10 B CFU, enteric-coated",
    delivery: "Capsule (refrigerated where possible)", why: "Enteric coating protects strains through gastric acid to the colon." },
];

const pillColor: Record<Row["type"], string> = {
  Vitamin: "bg-leaf/20 text-forest border-leaf/30",
  Mineral: "bg-mist/60 text-forest border-mist",
  Macro: "bg-primary/10 text-primary border-primary/15",
  Other: "bg-dew text-forest border-mist/60",
};

const solColor: Record<Row["solubility"], string> = {
  Fat: "text-amber-700 bg-amber-50 border border-amber-100",
  Water: "text-sky-700 bg-sky-50 border border-sky-100",
  "—": "text-muted-foreground bg-muted border border-border",
};

export const Nutrients = () => (
  <section id="nutrients" className="py-24 md:py-32 bg-background">
    <div className="container-tight">
      <div className="max-w-3xl mb-14">
        <div className="label-eyebrow mb-5">The nutrient library</div>
        <h2 className="font-serif text-4xl md:text-5xl text-primary leading-[1.05]">
          Every active. <em className="font-light">In the form your body uses.</em>
        </h2>
        <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
          A reference of the vitamins, minerals, macros and bioactives Nutrix formulates around — including the
          most bioavailable molecular form, the right delivery format, and why it matters.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dew/60 text-primary">
              <tr className="text-left">
                <th className="px-5 py-4 font-medium">Nutrient</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Solubility</th>
                <th className="px-5 py-4 font-medium">Best absorbable form</th>
                <th className="px-5 py-4 font-medium">Delivery</th>
                <th className="px-5 py-4 font-medium">Why this form</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={r.name} className={i % 2 ? "bg-background" : "bg-dew/15"}>
                  <td className="px-5 py-4 font-medium text-primary whitespace-nowrap">{r.name}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border ${pillColor[r.type]}`}>{r.type}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${solColor[r.solubility]}`}>{r.solubility}</span>
                  </td>
                  <td className="px-5 py-4 text-foreground">{r.bestForm}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.delivery}</td>
                  <td className="px-5 py-4 text-muted-foreground max-w-md">{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Reference summary, not medical advice. Consult a qualified practitioner for personalised dosing.
      </p>
    </div>
  </section>
);
