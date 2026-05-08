import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export const Hero = () => (
  <section id="top" className="relative overflow-hidden bg-gradient-hero">
    <div className="container-tight pt-20 pb-28 md:pt-28 md:pb-36">
      <div className="grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 animate-fade-up">
          <div className="label-eyebrow mb-5">Nutrix · Formulated to nourish</div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] text-primary">
            Science you can <em className="text-leaf not-italic">feel.</em><br />
            Nourishment you can <em className="italic font-light">trust.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Clinically dosed nutrition in the forms your body actually absorbs — powders, softgels, tablets, and capsules.
            No fluff. No mystery blends. Every milligram earns its place.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" className="bg-primary hover:bg-forest text-primary-foreground rounded-full px-7 h-12 shadow-soft">
              Explore the system
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-7 h-12 border-primary/20 text-primary hover:bg-mist/40">
              Read the science
            </Button>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              ["48", "Actives"],
              ["6", "Categories"],
              ["100%", "Transparent"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-serif text-3xl text-primary">{n}</dt>
                <dd className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="md:col-span-5 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-10 bg-leaf/20 blur-3xl rounded-full animate-pulse-soft" />
            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-forest flex items-center justify-center shadow-glow">
              <Logo size={220} variant="dark" withWordmark={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
