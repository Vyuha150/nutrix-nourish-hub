import { useEffect, useState } from "react";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { GoalConsultDialog } from "@/components/nutrix/GoalConsultDialog";
import { ArrowRight, Battery, Brain, Dumbbell, Moon, ShieldCheck, Sparkles, Heart, Leaf } from "lucide-react";
import hero from "@/assets/hero-2.jpg";
import imgEnergy from "@/assets/hero-3.jpg";
import imgImmunity from "@/assets/cat-capsules.jpg";
import imgFocus from "@/assets/hero-2.jpg";
import imgSleep from "@/assets/hero-1.jpg";
import imgStrength from "@/assets/cat-boosters.jpg";
import imgHeart from "@/assets/cat-beverages.jpg";
import imgSkin from "@/assets/cat-pastes.jpg";
import imgGut from "@/assets/cat-snacks.jpg";

const goals = [
  { icon: Battery, name: "All-day Energy", desc: "Mitochondrial support + B-complex + iron bisglycinate.", products: 6, lift: 32, time: "14 days", actives: ["B12 MeCbl", "Iron BG", "CoQ10", "Rhodiola"], image: imgEnergy },
  { icon: ShieldCheck, name: "Immunity", desc: "Vitamin C, zinc picolinate, vitamin D3, elderberry.", products: 5, lift: 41, time: "21 days", actives: ["Vit C Lipo", "Zinc Pic", "D3+K2", "Elderberry"], image: imgImmunity },
  { icon: Brain, name: "Focus & Memory", desc: "Algal omega-3 (DHA), L-theanine, lion's mane.", products: 4, lift: 27, time: "30 days", actives: ["DHA 600", "L-Theanine", "Lion's Mane", "α-GPC"], image: imgFocus },
  { icon: Moon, name: "Sleep & Recovery", desc: "Melatonin, magnesium glycinate, ashwagandha.", products: 5, lift: 38, time: "10 days", actives: ["Mg Glycinate", "Melatonin", "KSM-66", "Glycine"], image: imgSleep },
  { icon: Dumbbell, name: "Strength & Performance", desc: "Plant protein, creatine monohydrate, electrolytes.", products: 7, lift: 22, time: "60 days", actives: ["Pea+Rice", "Creatine 5g", "Electrolyte", "Beta-Alanine"], image: imgStrength },
  { icon: Heart, name: "Heart Health", desc: "Omega-3, CoQ10, vitamin K2, plant sterols.", products: 4, lift: 18, time: "90 days", actives: ["EPA/DHA", "Ubiquinol", "K2 MK-7", "Sterols"], image: imgHeart },
  { icon: Sparkles, name: "Skin, Hair & Nails", desc: "Biotin, marine collagen, silica, zinc.", products: 4, lift: 35, time: "45 days", actives: ["Collagen I+III", "Biotin", "Silica", "Tocotrienols"], image: imgSkin },
  { icon: Leaf, name: "Gut & Digestion", desc: "Prebiotic fibre, multi-strain probiotics, enzymes.", products: 5, lift: 44, time: "21 days", actives: ["PHGG", "Probiotic 30B", "Enzymes", "L-Glutamine"], image: imgGut },
];

const Goals = () => {
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  useEffect(() => { document.title = "Shop by Goal · Nutrix"; }, []);
  return (
    <Layout>
      <section className="bg-background pt-10 md:pt-14 pb-2">
        <div className="container-tight">
          <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight">
            Pick a goal. <em className="font-light">We'll formulate the rest.</em>
          </h1>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-background overflow-hidden">
        {/* futuristic backdrop */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -top-24 right-10 w-80 h-80 rounded-full bg-leaf/15 blur-3xl animate-pulse-soft pointer-events-none" />
        <div className="absolute -bottom-24 left-10 w-80 h-80 rounded-full bg-mist/40 blur-3xl animate-pulse-soft pointer-events-none" />

        <div className="container-tight relative">

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {goals.map((g, i) => {
              const C = 2 * Math.PI * 22;
              const dash = (g.lift / 100) * C;
              return (
                <button
                  type="button"
                  key={g.name}
                  onClick={() => setActiveGoal(g.name)}
                  className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 animate-fade-up flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image cover */}
                  <div className="relative aspect-[5/3] overflow-hidden">
                    <img
                      src={g.image}
                      alt={g.name}
                      width={800}
                      height={500}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                    {/* Icon chip */}
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-background/90 backdrop-blur flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                      <g.icon className="w-5 h-5 text-primary" />
                    </div>
                    {/* Lift ring */}
                    <div className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center">
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="22" fill="none" stroke="hsl(var(--primary-foreground) / 0.25)" strokeWidth="3" />
                        <circle
                          cx="25"
                          cy="25"
                          r="22"
                          fill="none"
                          stroke="hsl(var(--leaf))"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${C}`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="relative text-[10px] font-bold text-primary-foreground">+{g.lift}%</span>
                    </div>
                    <h3 className="absolute bottom-3 left-4 right-4 font-serif text-xl text-primary-foreground leading-tight drop-shadow-sm">{g.name}</h3>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>

                    {/* Active chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {g.actives.map((a) => (
                        <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-dew text-forest border border-mist/60 font-medium">
                          {a}
                        </span>
                      ))}
                    </div>

                    {/* Footer infographic */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">First results</div>
                        <div className="font-serif text-sm text-primary mt-0.5">{g.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Stack</div>
                        <div className="font-serif text-sm text-primary mt-0.5">{g.products} formulas</div>
                      </div>
                    </div>

                    {/* Animated progress bar */}
                    <div className="mt-4 h-1 bg-mist/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-leaf rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-leaf font-semibold uppercase tracking-wider">Build stack</span>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
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
      <GoalConsultDialog goal={activeGoal} onClose={() => setActiveGoal(null)} />
    </Layout>
  );
};

export default Goals;
