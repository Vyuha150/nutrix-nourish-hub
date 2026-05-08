import { useEffect, useState } from "react";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { Sparkles, Check, ArrowRight, RotateCcw } from "lucide-react";
import hero from "@/assets/cat-foundation.jpg";

type Step = { q: string; key: string; options: string[] };

const steps: Step[] = [
  { q: "What outcome matters most right now?", key: "goal", options: ["Energy", "Sleep", "Immunity", "Focus", "Strength", "Skin & hair"] },
  { q: "How would you describe your diet?", key: "diet", options: ["Mostly veg", "Vegan", "Omnivore", "Low carb"] },
  { q: "How active are you each week?", key: "activity", options: ["Sedentary", "2–3 sessions", "4–5 sessions", "Daily training"] },
  { q: "What's your age band?", key: "age", options: ["18–25", "26–35", "36–45", "46+"] },
];

const recommendFor = (a: Record<string, string>) => {
  const base = ["Complete Daily Foundation", "Vitamin D3 + K2", "Omega-3 Algal Softgel"];
  const map: Record<string, string[]> = {
    Energy: ["B-Complex Activated", "Iron Bisglycinate"],
    Sleep: ["Magnesium Glycinate", "Ashwagandha KSM-66", "Melatonin Softgel"],
    Immunity: ["Vitamin C Liposomal", "Zinc Picolinate", "Elderberry"],
    Focus: ["Algal DHA 600", "L-Theanine + Caffeine", "Lion's Mane"],
    Strength: ["Plant Protein", "Creatine Monohydrate", "Electrolyte Daily"],
    "Skin & hair": ["Marine Collagen", "Biotin + Silica", "Mixed Tocopherols"],
  };
  return [...base, ...(map[a.goal] || [])];
};

const StackFinder = () => {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  useEffect(() => { document.title = "Find Your Stack · Nutrix"; }, []);
  const done = step >= steps.length;
  const recs = done ? recommendFor(ans) : [];
  const reset = () => { setStep(0); setAns({}); };

  return (
    <Layout>
      <PageHero
        eyebrow="The 60-second consult"
        title={<>Your stack, <em className="font-light">your way.</em></>}
        sub="Four questions. One personalised set of formulas. No quizzes that just upsell — just the actives your body actually needs."
        image={hero}
      />

      <section className="py-20 bg-background">
        <div className="container-tight max-w-3xl">
          {!done ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-leaf">Step {step + 1} of {steps.length}</span>
                <div className="flex-1 mx-6 h-1 bg-mist rounded-full overflow-hidden">
                  <div className="h-full bg-leaf transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{Math.round(((step + 1) / steps.length) * 100)}%</span>
              </div>

              <div key={step} className="animate-fade-up">
                <h2 className="font-serif text-3xl md:text-4xl text-primary leading-tight">{steps[step].q}</h2>
                <div className="grid sm:grid-cols-2 gap-3 mt-8">
                  {steps[step].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAns((a) => ({ ...a, [steps[step].key]: opt }));
                        setStep((s) => s + 1);
                      }}
                      className="group flex items-center justify-between p-5 rounded-2xl border border-border bg-card hover:border-leaf hover:bg-dew/40 transition-all text-left"
                    >
                      <span className="font-serif text-lg text-primary">{opt}</span>
                      <ArrowRight className="w-4 h-4 text-leaf opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="mt-8 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 text-leaf mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">Your stack is ready</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-primary leading-tight">
                {recs.length} formulas, sequenced for <em className="font-light">{ans.goal?.toLowerCase()}</em>.
              </h2>
              <p className="text-muted-foreground mt-3">
                Built around your {ans.diet?.toLowerCase()} diet, {ans.activity?.toLowerCase()} routine and {ans.age} age band.
              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-3">
                {recs.map((r, i) => (
                  <div
                    key={r}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all animate-fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-leaf flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-serif text-base text-primary">{r}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <button className="h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-forest transition-colors">
                  Add full stack to cart
                </button>
                <button onClick={reset} className="h-12 px-6 rounded-full border border-border bg-card text-primary text-sm font-semibold hover:bg-dew transition-colors inline-flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default StackFinder;
