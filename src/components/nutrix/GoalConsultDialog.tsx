import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, RotateCcw, ShoppingBag, Clock, Pill } from "lucide-react";
import { useCommerce } from "./CommerceProvider";
import { resolveGoalStackProducts } from "@/lib/goalStacks";

type Question = { id: string; q: string; opts: string[] };
type Template = {
  headline: string;
  summary: string;
  products: { name: string; form: string; when: string; dose: string }[];
  protocol: string[];
};

const questions: Record<string, Question[]> = {
  "All-day Energy": [
    { id: "crash", q: "When does your energy crash hardest?", opts: ["Mid-morning", "After lunch", "Evening", "All day"] },
    { id: "sleep", q: "How many hours of sleep do you average?", opts: ["<5", "5–6", "6–7", "7+"] },
    { id: "caffeine", q: "Daily caffeine intake?", opts: ["None", "1 cup", "2–3 cups", "4+ cups"] },
    { id: "diet", q: "Any iron-limiting diet?", opts: ["Vegan", "Vegetarian", "Mostly veg", "Omnivore"] },
  ],
  Immunity: [
    { id: "freq", q: "How often do you fall sick in a year?", opts: ["Rarely", "2–3 times", "4–6 times", "Constantly"] },
    { id: "sun", q: "Daily sunlight exposure?", opts: ["<15 min", "15–30 min", "30–60 min", "1 hr+"] },
    { id: "stress", q: "Current stress level?", opts: ["Low", "Moderate", "High", "Very high"] },
    { id: "season", q: "Are you preparing for a season change?", opts: ["Yes — winter", "Yes — monsoon", "Travel", "No"] },
  ],
  "Focus & Memory": [
    { id: "screen", q: "Daily screen time?", opts: ["<4 hr", "4–6 hr", "6–9 hr", "9+ hr"] },
    { id: "fog", q: "Brain fog episodes per week?", opts: ["None", "1–2", "3–5", "Daily"] },
    { id: "sleep", q: "Sleep quality?", opts: ["Excellent", "Good", "Average", "Poor"] },
    { id: "diet", q: "Do you eat fatty fish weekly?", opts: ["3+ servings", "1–2", "Rarely", "Never"] },
  ],
  "Sleep & Recovery": [
    { id: "fall", q: "How long to fall asleep?", opts: ["<10 min", "10–30 min", "30–60 min", "60+ min"] },
    { id: "wake", q: "Night-time awakenings?", opts: ["None", "1", "2–3", "4+"] },
    { id: "screen", q: "Screen use in last hour before bed?", opts: ["Never", "Sometimes", "Often", "Always"] },
    { id: "stress", q: "Bedtime stress / racing thoughts?", opts: ["Rare", "Occasional", "Frequent", "Constant"] },
  ],
  "Strength & Performance": [
    { id: "sessions", q: "Training sessions per week?", opts: ["1–2", "3–4", "5–6", "Daily"] },
    { id: "type", q: "Primary modality?", opts: ["Strength", "Endurance", "Hybrid", "Sport"] },
    { id: "protein", q: "Daily protein intake?", opts: ["<60g", "60–100g", "100–140g", "140g+"] },
    { id: "recovery", q: "Soreness lingering > 48h?", opts: ["Never", "Sometimes", "Often", "Always"] },
  ],
  "Heart Health": [
    { id: "fish", q: "Fatty fish servings per week?", opts: ["3+", "1–2", "Rarely", "Never"] },
    { id: "bp", q: "Recent blood pressure?", opts: ["Optimal", "Slightly elevated", "Hypertensive", "Unsure"] },
    { id: "ldl", q: "LDL cholesterol status?", opts: ["Optimal", "Borderline", "High", "Unsure"] },
    { id: "activity", q: "Cardio per week?", opts: ["150+ min", "75–150", "<75", "None"] },
  ],
  "Skin, Hair & Nails": [
    { id: "concern", q: "Top concern right now?", opts: ["Hair fall", "Dull skin", "Brittle nails", "All three"] },
    { id: "diet", q: "Animal protein intake?", opts: ["Daily", "Weekly", "Rarely", "Never"] },
    { id: "sun", q: "Daily UV exposure?", opts: ["Heavy", "Moderate", "Low", "Indoors mostly"] },
    { id: "duration", q: "Concern duration?", opts: ["<1 month", "1–3 months", "3–6 months", "6 months+"] },
  ],
  "Gut & Digestion": [
    { id: "freq", q: "Bowel frequency?", opts: ["Multiple/day", "Daily", "Every 2 days", "Less"] },
    { id: "bloat", q: "Bloating frequency?", opts: ["Rare", "Weekly", "Most days", "Daily"] },
    { id: "fibre", q: "Daily fibre estimate?", opts: ["30g+", "20–30g", "10–20g", "<10g"] },
    { id: "antibio", q: "Antibiotics in last 6 months?", opts: ["No", "One course", "Two", "Three+"] },
  ],
};

const templates: Record<string, Template> = {
  "All-day Energy": {
    headline: "Your steady-state energy stack",
    summary: "Mitochondrial fuel + iron repletion + adaptogenic balance — without caffeine dependence.",
    products: [
      { name: "Activated B-Complex", form: "Tablet", when: "Morning, with breakfast", dose: "1 tablet" },
      { name: "Iron Bisglycinate 25mg", form: "Tablet", when: "Mid-morning, with vitamin C", dose: "1 tablet" },
      { name: "CoQ10 Ubiquinol 100mg", form: "Softgel", when: "With lunch", dose: "1 softgel" },
      { name: "Rhodiola Rosea 300mg", form: "Capsule", when: "Late morning", dose: "1 capsule" },
      { name: "Complete Daily Foundation", form: "Powder", when: "Morning shake", dose: "1 scoop" },
    ],
    protocol: ["Avoid caffeine within 90 min of iron", "Re-test ferritin in 8 weeks", "Pair with 7+ hr sleep target"],
  },
  Immunity: {
    headline: "Your immunity defence stack",
    summary: "Layered antiviral + barrier support — calibrated for your sun exposure and stress band.",
    products: [
      { name: "Vitamin C Liposomal 1000mg", form: "Capsule", when: "Split AM/PM", dose: "1+1" },
      { name: "Zinc Picolinate 22mg", form: "Tablet", when: "With dinner", dose: "1 tablet" },
      { name: "Vitamin D3 + K2 (5000 IU)", form: "Softgel", when: "With breakfast fats", dose: "1 softgel" },
      { name: "Elderberry Extract", form: "Capsule", when: "At first symptom", dose: "2 capsules" },
      { name: "Probiotic 30B Multi-strain", form: "Capsule", when: "Empty stomach AM", dose: "1 capsule" },
    ],
    protocol: ["Do not exceed 40mg zinc/day", "Re-test 25-OH-D in 12 weeks", "Pause elderberry on autoimmune flares"],
  },
  "Focus & Memory": {
    headline: "Your cognitive clarity stack",
    summary: "Membrane lipids + neurotransmitter precursors + steady wakeful calm.",
    products: [
      { name: "Algal DHA 600mg", form: "Softgel", when: "With lunch", dose: "1 softgel" },
      { name: "L-Theanine 200mg", form: "Capsule", when: "With morning coffee", dose: "1 capsule" },
      { name: "Lion's Mane 1000mg", form: "Capsule", when: "Morning", dose: "1 capsule" },
      { name: "Alpha-GPC 300mg", form: "Capsule", when: "Pre-deep work", dose: "1 capsule" },
    ],
    protocol: ["Cycle 5 days on / 2 off", "Reassess in 6 weeks", "Pair with 30 min daily walk"],
  },
  "Sleep & Recovery": {
    headline: "Your sleep architecture stack",
    summary: "Sleep onset + deep-sleep magnesium + stress decompression — non-habit-forming.",
    products: [
      { name: "Magnesium Glycinate 400mg", form: "Capsule", when: "60 min before bed", dose: "2 capsules" },
      { name: "Melatonin 0.3mg micro-dose", form: "Softgel", when: "30 min before bed", dose: "1 softgel" },
      { name: "Ashwagandha KSM-66 600mg", form: "Capsule", when: "With dinner", dose: "1 capsule" },
      { name: "Glycine 3g", form: "Powder", when: "Stir into water at bedtime", dose: "1 scoop" },
    ],
    protocol: ["Lights down 1 hr before bed", "No screens last 30 min", "Re-evaluate in 14 days"],
  },
  "Strength & Performance": {
    headline: "Your performance stack",
    summary: "Protein synthesis + creatine saturation + electrolyte recovery.",
    products: [
      { name: "Plant Protein (Pea+Rice) 25g", form: "Powder", when: "Post-training", dose: "1 scoop" },
      { name: "Creatine Monohydrate 5g", form: "Powder", when: "Daily, anytime", dose: "1 scoop" },
      { name: "Electrolyte Daily", form: "Powder", when: "During training", dose: "1 sachet" },
      { name: "Beta-Alanine 3.2g", form: "Powder", when: "Pre-training", dose: "1 scoop" },
      { name: "Vitamin D3 + K2", form: "Softgel", when: "Morning, with fats", dose: "1 softgel" },
    ],
    protocol: ["Hit 1.6–2.0 g/kg protein", "Hydrate 35 ml/kg", "De-load every 6 weeks"],
  },
  "Heart Health": {
    headline: "Your cardiometabolic stack",
    summary: "Omega-3 saturation + mitochondrial CoQ10 + calcium routing.",
    products: [
      { name: "Algal EPA/DHA 1000mg", form: "Softgel", when: "With lunch", dose: "1 softgel" },
      { name: "CoQ10 Ubiquinol 100mg", form: "Softgel", when: "With breakfast", dose: "1 softgel" },
      { name: "Vitamin K2 MK-7 200mcg", form: "Softgel", when: "With D3", dose: "1 softgel" },
      { name: "Plant Sterols 2g", form: "Tablet", when: "With largest meal", dose: "2 tablets" },
    ],
    protocol: ["Re-test lipid panel in 12 weeks", "Aim 150 min cardio/week", "Limit ultra-processed foods"],
  },
  "Skin, Hair & Nails": {
    headline: "Your beauty-from-within stack",
    summary: "Collagen scaffold + biotin + silica + tocotrienols for cell-membrane integrity.",
    products: [
      { name: "Marine Collagen Type I+III 10g", form: "Powder", when: "Morning, with vitamin C", dose: "1 scoop" },
      { name: "Biotin 5mg + Silica", form: "Tablet", when: "With breakfast", dose: "1 tablet" },
      { name: "Mixed Tocotrienols", form: "Softgel", when: "With dinner", dose: "1 softgel" },
      { name: "Zinc Picolinate 22mg", form: "Tablet", when: "Evening, away from calcium", dose: "1 tablet" },
    ],
    protocol: ["Allow full hair cycle: 90 days", "Daily SPF 30+", "Photo-track week 1, 4, 12"],
  },
  "Gut & Digestion": {
    headline: "Your gut reset stack",
    summary: "Prebiotic substrate + multi-strain probiotic + enzymatic support + barrier repair.",
    products: [
      { name: "PHGG Prebiotic Fibre 5g", form: "Powder", when: "Morning, in water", dose: "1 scoop" },
      { name: "Probiotic 30B (10-strain)", form: "Capsule", when: "Empty stomach AM", dose: "1 capsule" },
      { name: "Digestive Enzyme Complex", form: "Capsule", when: "With heavy meals", dose: "1 capsule" },
      { name: "L-Glutamine 5g", form: "Powder", when: "Bedtime, in water", dose: "1 scoop" },
    ],
    protocol: ["Ramp fibre slowly over 7 days", "Hydrate 35 ml/kg", "Re-evaluate symptoms at week 3"],
  },
};

type Props = {
  goal: string | null;
  onClose: () => void;
};

export const GoalConsultDialog = ({ goal, onClose }: Props) => {
  const { products, addProductsToCart } = useCommerce();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setError(null);
  }, [goal]);

  if (!goal) return null;
  const qs = questions[goal] ?? [];
  const tpl = templates[goal];
  const matchedProducts = resolveGoalStackProducts(goal, products, tpl.products.map((entry) => entry.name));

  const handleSubmit = () => {
    const missing = qs.filter((q) => !answers[q.id]);
    if (missing.length) {
      setError(`Please answer all ${qs.length} questions to continue.`);
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <Dialog open={!!goal} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        {!submitted ? (
          <>
            <DialogHeader>
              <div className="label-eyebrow mb-2">60-second consult</div>
              <DialogTitle className="font-serif text-3xl text-primary leading-tight">
                {goal}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Four close-ended questions. We'll surface a curated stack you can add to your cart in one click.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-6">
              {qs.map((q, i) => (
                <div key={q.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="font-serif text-leaf text-sm">0{i + 1}</span>
                    <h4 className="font-serif text-base text-primary">{q.q}</h4>
                  </div>
                  <RadioGroup
                    value={answers[q.id] ?? ""}
                    onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                    className="grid grid-cols-2 gap-2"
                  >
                    {q.opts.map((opt) => {
                      const id = `${q.id}-${opt}`;
                      const checked = answers[q.id] === opt;
                      return (
                        <Label
                          key={opt}
                          htmlFor={id}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? "border-leaf bg-dew/60 text-primary shadow-soft"
                              : "border-border bg-background hover:border-leaf/60 hover:bg-dew/30 text-muted-foreground"
                          }`}
                        >
                          <RadioGroupItem id={id} value={opt} className="border-leaf text-leaf" />
                          <span className="text-xs font-medium">{opt}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-xs text-destructive mt-2 animate-fade-up">{error}</p>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
              <Button onClick={handleSubmit} className="rounded-full bg-primary hover:bg-forest text-primary-foreground gap-2">
                <Sparkles className="w-4 h-4" /> Reveal my stack
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-leaf mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.18em] font-semibold">Curated for you</span>
              </div>
              <DialogTitle className="font-serif text-3xl text-primary leading-tight">
                {tpl.headline}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">{tpl.summary}</DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-3">
              {tpl.products.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-background/60 hover:bg-dew/40 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-leaf flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h4 className="font-serif text-base text-primary leading-tight">{p.name}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-leaf font-semibold">{p.form}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {p.when}</span>
                      <span>· {p.dose}</span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-leaf mt-1.5 shrink-0" />
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 mt-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-leaf font-semibold mb-2">Protocol notes</div>
              <ul className="space-y-1.5">
                {tpl.protocol.map((p) => (
                  <li key={p} className="flex gap-2 text-xs text-forest">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-leaf shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                onClick={() => {
                  if (addProductsToCart(matchedProducts)) {
                    onClose();
                  }
                }}
                className="rounded-full bg-primary hover:bg-forest text-primary-foreground gap-2 flex-1"
              >
                <ShoppingBag className="w-4 h-4" /> Add stack to cart
              </Button>
              <Button
                variant="outline"
                onClick={() => { setSubmitted(false); setAnswers({}); }}
                className="rounded-full gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retake
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
