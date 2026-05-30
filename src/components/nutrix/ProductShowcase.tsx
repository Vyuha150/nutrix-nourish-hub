import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Star } from "lucide-react";
import { useCommerce } from "./CommerceProvider";
import { resolveProductImage } from "@/lib/productMedia";

const ProductCard = ({ p }: { p: ReturnType<typeof useCommerce>["products"][number] }) => {
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  return (
    <article className="snap-start shrink-0 w-[260px] md:w-[300px] group">
      <div className="relative aspect-[4/5] rounded-2xl bg-dew overflow-hidden shadow-soft group-hover:shadow-card transition-all duration-500">
        <span className="absolute top-3 left-3 z-10 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full bg-leaf text-leaf-foreground">
          {p.showcaseGroup === "best" ? "BEST" : "NEW"}
        </span>
        <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors">
          <Heart className="w-4 h-4 text-primary" />
        </button>
        <img
          src={resolveProductImage(p)}
          alt={p.name}
          width={1024}
          height={1024}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <button className="w-full h-10 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-forest transition-colors inline-flex items-center justify-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to cart
          </button>
        </div>
      </div>
      <div className="pt-4 px-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-leaf font-semibold">{p.category}</p>
        <h3 className="font-serif text-[17px] text-primary mt-1 leading-snug line-clamp-2 min-h-[44px]">{p.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{p.form}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 fill-leaf text-leaf" />
          <span className="text-primary font-medium">{p.rating}</span>
          <span>· {p.reviews} reviews</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-serif text-xl text-primary">₹{p.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground line-through">₹{p.mrp.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-leaf">{off}% OFF</span>
        </div>
      </div>
    </article>
  );
};

export const ProductShowcase = () => {
  const { products } = useCommerce();
  const [tab, setTab] = useState<"best" | "new">("best");
  const trackRef = useRef<HTMLDivElement>(null);
  const list = useMemo(
    () => products.filter((product) => (tab === "best" ? product.showcaseGroup === "best" : product.showcaseGroup === "new")),
    [products, tab]
  );

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section id="shop" className="py-20 md:py-28 bg-dew/40">
      <div className="container-tight">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="flex gap-8">
            {(["best", "new"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative font-serif text-2xl md:text-3xl pb-2 transition-colors ${
                  tab === t ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {t === "best" ? "Best Sellers" : "New Arrivals"}
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-0.5 bg-leaf transition-transform duration-500 origin-left ${
                    tab === t ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-11 h-11 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-11 h-11 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-6 px-6 md:-mx-10 md:px-10"
        >
          {list.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
