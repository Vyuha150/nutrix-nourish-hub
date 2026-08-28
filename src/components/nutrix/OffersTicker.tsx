import { Sparkles, Gift, Truck, Percent, Crown, Star } from "lucide-react";

const offers = [
  { icon: Percent, text: "Up to 30% off on Daily Foundation bundles" },
  { icon: Truck, text: "Free shipping on orders over ₹999" },
  { icon: Crown, text: "Join Nutrix Circle — 1 point per ₹1 spent" },
  { icon: Gift, text: "Members-only early drops & exclusive stacks" },
  { icon: Sparkles, text: "Subscribe & save an extra 10% every month" },
  { icon: Star, text: "Refer a friend — both get ₹200 off" },
  { icon: Percent, text: "First order welcome code: NUTRIX20" },
];

interface OffersTickerProps {
  variant?: "full" | "sleek";
}

export const OffersTicker = ({ variant = "full" }: OffersTickerProps) => {
  if (variant === "sleek") {
    return (
      <section className="relative overflow-hidden bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -left-20 -top-10 w-56 h-56 rounded-full bg-leaf blur-[90px]" />
          <div className="absolute -right-20 -bottom-10 w-64 h-64 rounded-full bg-forest blur-[90px]" />
        </div>

        <div className="relative flex items-center">
          <div className="shrink-0 hidden md:flex items-center gap-2 px-5 py-2.5 border-r border-primary-foreground/10 bg-primary-foreground/5">
            <Sparkles className="w-3.5 h-3.5 text-leaf" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Loyalty & Offers</span>
          </div>

          <div className="relative flex-1 overflow-hidden py-2">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />
            <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
              {[...offers, ...offers, ...offers, ...offers].map((o, i) => (
                <div
                  key={i}
                  className="group mx-4 flex items-center gap-2.5 text-xs font-medium tracking-wide"
                >
                  <o.icon className="w-3.5 h-3.5 text-leaf group-hover:scale-110 transition-transform" />
                  <span className="text-primary-foreground/90 group-hover:text-primary-foreground transition-colors">
                    {o.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 hidden md:block px-5 py-2.5 border-l border-primary-foreground/10 bg-primary-foreground/5">
            <a href="/offers" className="text-[11px] font-semibold uppercase tracking-wider hover:text-leaf transition-colors">
              View all →
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground py-12">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -left-20 top-0 w-72 h-72 rounded-full bg-leaf blur-[100px]" />
        <div className="absolute -right-20 bottom-0 w-80 h-80 rounded-full bg-forest blur-[100px]" />
      </div>

      <div className="relative container-tight mb-7 text-center">
        <p className="label-eyebrow mb-2 text-leaf">Offers & loyalty</p>
        <h2 className="font-serif text-3xl md:text-4xl leading-tight">
          Rewards that keep you consistent.
        </h2>
        <p className="mt-3 text-sm md:text-base text-primary-foreground/80 max-w-lg mx-auto">
          Save on every stack, earn points with every order, and unlock member-only drops.
        </p>
      </div>

      <div className="relative">
        <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
          {[...offers, ...offers, ...offers].map((o, i) => (
            <div
              key={i}
              className="group mx-3 flex items-center gap-4 px-6 py-4 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 hover:bg-primary-foreground/20 hover:border-leaf/40 transition-all duration-300 min-w-max"
            >
              <div className="w-9 h-9 rounded-full bg-leaf/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-leaf/30 transition-all duration-300">
                <o.icon className="w-4 h-4 text-leaf" />
              </div>
              <span className="text-sm font-medium tracking-wide">{o.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative container-tight mt-9 flex flex-wrap items-center justify-center gap-4">
        <a
          href="/offers"
          className="inline-flex items-center justify-center px-7 h-11 rounded-full bg-leaf text-primary font-semibold text-sm hover:bg-dew transition-colors duration-300"
        >
          Browse all offers
        </a>
        <a
          href="/goals"
          className="inline-flex items-center justify-center px-7 h-11 rounded-full bg-transparent text-primary-foreground font-semibold text-sm border border-primary-foreground/30 hover:bg-primary-foreground/10 hover:border-leaf/50 transition-colors duration-300"
        >
          Find your stack
        </a>
      </div>
    </section>
  );
};
