import { Button } from "@/components/ui/button";

export const Science = () => (
  <section id="science" className="py-24 md:py-32 bg-gradient-forest text-primary-foreground">
    <div className="container-tight">
      <div className="grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7">
          <div className="text-xs uppercase tracking-[0.18em] font-medium text-leaf mb-5">Built on evidence</div>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05]">
            More energy for your workday. <br />
            <em className="font-light opacity-90">Not "contains CoQ10."</em>
          </h2>
          <p className="mt-6 text-lg opacity-80 leading-relaxed max-w-xl">
            Outcome-first claims, ingredient-deep formulation. Every batch independently assayed for potency,
            heavy metals and microbial safety. We publish the certificates of analysis, not just the marketing.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" className="bg-leaf hover:bg-leaf/90 text-primary rounded-full px-7 h-12">
              See latest CoA
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-7 h-12 border-mist/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              Methodology
            </Button>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="grid gap-4">
            {[
              ["Third-party tested", "Every lot, every active, public CoA."],
              ["Clinically dosed", "Amounts that match study protocols, not minimums."],
              ["Transparent labels", "Full quantities. No 'proprietary blends.'"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-mist/20 bg-primary-foreground/5 p-5">
                <div className="font-serif text-xl text-leaf">{t}</div>
                <div className="text-sm opacity-80 mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
