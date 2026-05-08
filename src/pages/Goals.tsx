import { useEffect } from "react";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { ArrowRight, Battery, Brain, Dumbbell, Moon, ShieldCheck, Sparkles, Heart, Leaf } from "lucide-react";
import hero from "@/assets/hero-2.jpg";

const goals = [
  { icon: Battery, name: "All-day Energy", desc: "Mitochondrial support + B-complex + iron bisglycinate.", products: 6, tone: "from-leaf to-forest" },
  { icon: ShieldCheck, name: "Immunity", desc: "Vitamin C, zinc picolinate, vitamin D3, elderberry.", products: 5, tone: "from-forest to-primary" },
  { icon: Brain, name: "Focus & Memory", desc: "Algal omega-3 (DHA), L-theanine, lion's mane.", products: 4, tone: "from-leaf to-primary" },
  { icon: Moon, name: "Sleep & Recovery", desc: "Melatonin, magnesium glycinate, ashwagandha.", products: 5, tone: "from-primary to-forest" },
  { icon: Dumbbell, name: "Strength & Performance", desc: "Plant protein, creatine monohydrate, electrolytes.", products: 7, tone: "from-forest to-leaf" },
  { icon: Heart, name: "Heart Health", desc: "Omega-3, CoQ10, vitamin K2, plant sterols.", products: 4, tone: "from-primary to-leaf" },
  { icon: Sparkles, name: "Skin, Hair & Nails", desc: "Biotin, marine collagen, silica, zinc.", products: 4, tone: "from-leaf to-mist" },
  { icon: Leaf, name: "Gut & Digestion", desc: "Prebiotic fibre, multi-strain probiotics, enzymes.", products: 5, tone: "from-forest to-mist" },
];

const Goals = () => {
  useEffect(() => { document.title = "Shop by Goal · Nutrix"; }, []);
  return (
    <Layout>
      <PageHero
        eyebrow="Outcome-led nutrition"
        title={<>Pick a goal. <em className="font-light">We'll formulate the rest.</em></>}
        sub="Eight clinically-grounded outcome stacks. Built from the same transparent actives — sequenced for the result you actually want."
        image={hero}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="container-tight">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {goals.map((g, i) => (
              <a
                href="#"
                key={g.name}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card p-7 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`absolute -right-12 -top-12 w-44 h-44 rounded-full bg-gradient-to-br ${g.tone} opacity-10 group-hover:opacity-25 group-hover:scale-125 transition-all duration-700`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-leaf flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                    <g.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-primary mt-5 leading-tight">{g.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{g.desc}</p>
                  <div className="flex items-center justify-between mt-6 text-xs">
                    <span className="text-leaf font-semibold uppercase tracking-wider">{g.products} formulas</span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-forest text-primary-foreground">
        <div className="container-tight grid md:grid-cols-3 gap-10">
          {[
            { n: "01", t: "Diagnose", d: "Tell us your goal, lifestyle and current diet in 90 seconds." },
            { n: "02", t: "Design", d: "We map your stack from 48 actives — no overlap, no gaps." },
            { n: "03", t: "Deliver", d: "Powders, softgels, tablets — sequenced morning to night." },
          ].map((s, i) => (
            <div key={s.n} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="font-serif text-5xl text-leaf">{s.n}</div>
              <h3 className="font-serif text-2xl mt-3">{s.t}</h3>
              <p className="text-primary-foreground/75 mt-2 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Goals;
