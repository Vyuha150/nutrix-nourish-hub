import { useEffect } from "react";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { Beaker, FlaskConical, Microscope, FileCheck2, Atom } from "lucide-react";
import hero from "@/assets/hero-2.jpg";

const pillars = [
  { icon: Microscope, t: "Evidence-graded", d: "Every claim mapped to peer-reviewed RCT or systematic review. No mechanism-only marketing." },
  { icon: FlaskConical, t: "Clinically dosed", d: "Active mg matches the dose used in the cited trial — no underdosed proprietary blends." },
  { icon: Atom, t: "Bioavailable forms", d: "Methylfolate over folic acid. Glycinate over oxide. Ubiquinol over ubiquinone." },
  { icon: Beaker, t: "Third-party assayed", d: "Independent ISO-17025 labs verify potency, identity and contaminants on every lot." },
  { icon: FileCheck2, t: "Open-CoA", d: "Scan the QR on every pack to read the actual lot's certificate of analysis." },
];

const trials = [
  { name: "Magnesium glycinate", outcome: "+38% sleep onset speed", n: "n=126 RCT, 2022" },
  { name: "Algal DHA 1g/d", outcome: "−14% triglycerides", n: "Meta-analysis 2021" },
  { name: "Vitamin D3 + K2", outcome: "+9% bone density vs D3 alone", n: "n=240 RCT, 2020" },
  { name: "Methylfolate 5-MTHF", outcome: "2.7× plasma folate vs folic acid", n: "Crossover, 2019" },
  { name: "Curcumin + piperine", outcome: "20× absorption vs plain curcumin", n: "PK study, 2018" },
  { name: "Creatine 5g/d", outcome: "+8% strength, +1.4kg LBM", n: "Meta-analysis 2023" },
];

const Science = () => {
  useEffect(() => { document.title = "Science · Nutrix"; }, []);
  return (
    <Layout>
      <PageHero
        eyebrow="The method"
        title={<>Built like research. <em className="font-light">Sold like food.</em></>}
        sub="A five-step formulation pipeline. Independent labs. Open certificates. The kind of rigour you usually only see behind a pharma counter."
        image={hero}
      />

      <section className="py-20 bg-background">
        <div className="container-tight">
          <div className="label-eyebrow mb-4">Five non-negotiables</div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-12">How a Nutrix formula is born.</h2>
          <div className="grid md:grid-cols-5 gap-5">
            {pillars.map((p, i) => (
              <div
                key={p.t}
                className="relative rounded-2xl bg-card border border-border p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="font-serif text-4xl text-leaf/40 absolute top-3 right-4">0{i + 1}</div>
                <div className="w-11 h-11 rounded-xl bg-gradient-leaf flex items-center justify-center shadow-soft">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg text-primary mt-4">{p.t}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-forest text-primary-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--leaf)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container-tight relative">
          <div className="label-eyebrow text-leaf mb-4">Outcomes, not promises</div>
          <h2 className="font-serif text-3xl md:text-4xl mb-12">Trial-grade results, ingredient by ingredient.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {trials.map((t, i) => (
              <div
                key={t.name}
                className="rounded-2xl bg-primary-foreground/5 backdrop-blur border border-leaf/20 p-6 hover:border-leaf/60 transition-all animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="text-leaf font-serif text-3xl">{t.outcome}</div>
                <div className="font-serif text-lg mt-3">{t.name}</div>
                <div className="text-xs text-primary-foreground/60 mt-1 uppercase tracking-wider">{t.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container-tight grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="label-eyebrow mb-4">From bench to bottle</div>
            <h2 className="font-serif text-3xl md:text-4xl text-primary leading-tight">A 14-step quality pipeline.</h2>
            <ol className="mt-8 space-y-4">
              {[
                "Raw material identity (FTIR + HPLC)",
                "Heavy metal screen (ICP-MS)",
                "Microbial load + pathogen panel",
                "Active assay vs reference standard",
                "Bioavailability matrix (when relevant)",
                "Stability trial (24-month accelerated)",
                "Independent third-party retest",
              ].map((s, i) => (
                <li key={s} className="flex gap-4 animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="font-serif text-leaf w-8 shrink-0">0{i + 1}</span>
                  <span className="text-sm text-muted-foreground">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card">
            <img src={hero} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-primary-foreground">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-80">Lot #NTX-2024-0918</p>
              <p className="font-serif text-2xl mt-2">Every batch. Every test. Every receipt.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Science;
