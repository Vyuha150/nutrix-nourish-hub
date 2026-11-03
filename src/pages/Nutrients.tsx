import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { Search, ArrowUpRight } from "lucide-react";
import hero from "@/assets/hero-3.jpg";

type Row = {
  name: string;
  type: "Vitamin" | "Mineral" | "Macro" | "Bioactive";
  sol: "Fat" | "Water" | "—";
  form: string;
  delivery: string;
  why: string;
  product: string; // name of a product in /shop
};

const data: Row[] = [
  { name: "Vitamin A (Retinyl palmitate)", type: "Vitamin", sol: "Fat", form: "Pre-formed retinol", delivery: "Softgel with meal", why: "Vision, immunity, skin turnover", product: "Multivitamin (Adults)" },
  { name: "Vitamin B1 (Thiamine HCl)", type: "Vitamin", sol: "Water", form: "Benfotiamine for nerves", delivery: "Tablet, with food", why: "Energy from carbohydrates", product: "Multivitamin (Adults)" },
  { name: "Vitamin B2 (Riboflavin-5-phosphate)", type: "Vitamin", sol: "Water", form: "Activated R5P", delivery: "Tablet", why: "Mitochondrial energy", product: "Multivitamin (Adults)" },
  { name: "Vitamin B3 (Niacinamide)", type: "Vitamin", sol: "Water", form: "Niacinamide (no flush)", delivery: "Tablet", why: "NAD+, skin barrier", product: "Multivitamin (Adults)" },
  { name: "Vitamin B6 (P-5-P)", type: "Vitamin", sol: "Water", form: "Pyridoxal-5-phosphate", delivery: "Tablet", why: "Neurotransmitter synthesis", product: "Multivitamin (Adults)" },
  { name: "Folate", type: "Vitamin", sol: "Water", form: "L-methylfolate (5-MTHF)", delivery: "Tablet", why: "DNA synthesis, methylation", product: "Multivitamin (Adults)" },
  { name: "Vitamin B12", type: "Vitamin", sol: "Water", form: "Methylcobalamin", delivery: "Sublingual or tablet", why: "Nerve, blood, energy", product: "Multivitamin (Adults)" },
  { name: "Vitamin C", type: "Vitamin", sol: "Water", form: "Liposomal ascorbate", delivery: "Powder or capsule", why: "Antioxidant, collagen, iron uptake", product: "Daily Greens Drink" },
  { name: "Vitamin D3", type: "Vitamin", sol: "Fat", form: "Cholecalciferol + K2 MK-7", delivery: "Softgel with fat", why: "Bone, immunity, mood", product: "Vitamin D3 + K2 (MK-7)" },
  { name: "Vitamin E", type: "Vitamin", sol: "Fat", form: "Mixed tocopherols + tocotrienols", delivery: "Softgel", why: "Lipid antioxidant", product: "Multivitamin (Adults)" },
  { name: "Vitamin K2", type: "Vitamin", sol: "Fat", form: "Menaquinone-7 (MK-7)", delivery: "Softgel with D3", why: "Calcium routing to bone", product: "Vitamin D3 + K2 (MK-7)" },
  { name: "Calcium", type: "Mineral", sol: "—", form: "Calcium citrate-malate", delivery: "Tablet, split dose", why: "Bone density, signaling", product: "Complete Daily Foundation" },
  { name: "Magnesium", type: "Mineral", sol: "—", form: "Glycinate / L-threonate", delivery: "Capsule, evening", why: "300+ enzymes, sleep, muscle", product: "Sleep Support Melatonin" },
  { name: "Iron", type: "Mineral", sol: "—", form: "Ferrous bisglycinate", delivery: "Tablet with vit C", why: "Oxygen transport", product: "Iron-Rich Ragi Powder" },
  { name: "Zinc", type: "Mineral", sol: "—", form: "Zinc picolinate", delivery: "Tablet, away from iron/calcium", why: "Immunity, skin, hormones", product: "Multivitamin (Adults)" },
  { name: "Selenium", type: "Mineral", sol: "—", form: "Selenomethionine", delivery: "Tablet", why: "Thyroid, glutathione", product: "Multivitamin (Adults)" },
  { name: "Iodine", type: "Mineral", sol: "—", form: "Potassium iodide", delivery: "Tablet", why: "Thyroid hormone synthesis", product: "Multivitamin (Adults)" },
  { name: "Omega-3 (EPA/DHA)", type: "Macro", sol: "Fat", form: "Algal triglyceride form", delivery: "Softgel with meal", why: "Heart, brain, inflammation", product: "Omega-3 Algal Softgel" },
  { name: "Plant Protein", type: "Macro", sol: "—", form: "Pea + rice isolate (full PDCAAS)", delivery: "Powder", why: "Muscle protein synthesis", product: "High-Protein Dosa Premix" },
  { name: "Fibre (Prebiotic)", type: "Macro", sol: "—", form: "Partially hydrolysed guar + acacia", delivery: "Powder, soluble", why: "Microbiome, satiety", product: "Daily Greens Drink" },
  { name: "Creatine", type: "Bioactive", sol: "—", form: "Creatine monohydrate", delivery: "Powder, daily", why: "Strength, cognition", product: "Spirulina + Moringa Shake" },
  { name: "Curcumin", type: "Bioactive", sol: "Fat", form: "With piperine or phytosomal", delivery: "Capsule with meal", why: "Anti-inflammatory", product: "Turmeric Latte Premix" },
  { name: "Ashwagandha", type: "Bioactive", sol: "—", form: "KSM-66 root extract", delivery: "Capsule", why: "Stress adaptation, sleep", product: "Sleep Support Melatonin" },
  { name: "Probiotics", type: "Bioactive", sol: "—", form: "Multi-strain, ≥10B CFU", delivery: "Capsule, refrigerated", why: "Gut, immunity", product: "Daily Greens Drink" },
  { name: "CoQ10", type: "Bioactive", sol: "Fat", form: "Ubiquinol", delivery: "Softgel with fat", why: "Heart, mitochondria", product: "Omega-3 Algal Softgel" },
  { name: "Choline", type: "Bioactive", sol: "Water", form: "Alpha-GPC", delivery: "Capsule", why: "Brain, liver, membranes", product: "Multivitamin (Adults)" },
  { name: "Lutein + Zeaxanthin", type: "Bioactive", sol: "Fat", form: "FloraGLO 10:2", delivery: "Softgel", why: "Macular health, screens", product: "Multivitamin (Adults)" },
  { name: "Collagen", type: "Bioactive", sol: "—", form: "Type I + III hydrolysate", delivery: "Powder", why: "Skin, joints, tendons", product: "Seed Butter Blend" },
];

const typeColor: Record<Row["type"], string> = {
  Vitamin: "bg-leaf/20 text-forest",
  Mineral: "bg-mist text-forest",
  Macro: "bg-primary/10 text-primary",
  Bioactive: "bg-dew text-forest",
};
const solColor: Record<Row["sol"], string> = {
  Fat: "text-amber-700",
  Water: "text-sky-700",
  "—": "text-muted-foreground",
};

const Nutrients = () => {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | Row["type"]>("All");
  useEffect(() => { document.title = "Nutrient Library · Nutrix"; }, []);

  const list = data.filter(
    (r) => (filter === "All" || r.type === filter) && (r.name.toLowerCase().includes(q.toLowerCase()) || r.why.toLowerCase().includes(q.toLowerCase()))
  );

  const types: ("All" | Row["type"])[] = ["All", "Vitamin", "Mineral", "Macro", "Bioactive"];

  return (
    <Layout>
      <PageHero
        eyebrow="The encyclopaedia"
        title={<>Every active. <em className="font-light">In its most absorbable form.</em></>}
        sub="48 actives. Their best-absorbed chemical form, water-or-fat solubility, ideal delivery format, and why they earn shelf-space."
        image={hero}
      />

      <section className="py-16 bg-background">
        <div className="container-tight">
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {[
              ["Vitamins", data.filter((r) => r.type === "Vitamin").length],
              ["Minerals", data.filter((r) => r.type === "Mineral").length],
              ["Macros", data.filter((r) => r.type === "Macro").length],
              ["Bioactives", data.filter((r) => r.type === "Bioactive").length],
            ].map(([l, n], i) => (
              <div key={l} className="rounded-2xl border border-border bg-card p-5 shadow-soft animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="font-serif text-4xl text-primary">{n}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a nutrient or benefit…"
                className="w-full h-11 rounded-full bg-dew text-primary placeholder:text-muted-foreground pl-11 pr-5 text-sm outline-none focus:ring-2 focus:ring-leaf transition-all"
              />
              {q.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-card shadow-lg z-20 overflow-hidden text-xs max-h-60 overflow-y-auto divide-y divide-border/60">
                  {list.slice(0, 6).map((r) => (
                    <div
                      key={r.name}
                      onClick={() => setQ(r.name.split(" ")[0])}
                      className="p-2.5 px-4 hover:bg-muted/40 cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold text-primary">{r.name}</span>
                        <span className="text-muted-foreground ml-2">· {r.why}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">{r.type}</span>
                    </div>
                  ))}
                  {list.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">No matching nutrients found</div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`shrink-0 px-4 h-9 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    filter === t ? "bg-primary text-primary-foreground" : "bg-dew text-primary hover:bg-mist"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-soft bg-card">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="text-left p-4 font-medium">Nutrient</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Type</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Solubility</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Best Form</th>
                  <th className="text-left p-4 font-medium hidden xl:table-cell">Delivery</th>
                  <th className="text-left p-4 font-medium">Why it matters</th>
                  <th className="text-left p-4 font-medium">Find in shop</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => (
                  <tr key={r.name} className={`border-t border-border hover:bg-dew/40 transition-colors ${i % 2 ? "bg-background" : "bg-card"}`}>
                    <td className="p-4 font-serif text-primary">{r.name}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${typeColor[r.type]}`}>{r.type}</span>
                    </td>
                    <td className={`p-4 hidden lg:table-cell font-medium ${solColor[r.sol]}`}>{r.sol}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{r.form}</td>
                    <td className="p-4 hidden xl:table-cell text-muted-foreground">{r.delivery}</td>
                    <td className="p-4 text-muted-foreground">{r.why}</td>
                    <td className="p-4">
                      <Link
                        to={`/shop?q=${encodeURIComponent(r.product)}`}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-leaf/15 text-forest text-xs font-semibold hover:bg-leaf/30 transition-colors group/link whitespace-nowrap"
                        title={`Shop ${r.product}`}
                      >
                        <span className="max-w-[140px] truncate">{r.product}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No matches. Try another keyword.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Nutrients;
