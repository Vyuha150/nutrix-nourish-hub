import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart, ShoppingBag, Star, Filter, Search, X } from "lucide-react";
import hero from "@/assets/hero-1.jpg";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { useCommerce } from "@/components/nutrix/CommerceProvider";
import { resolveProductImage, resolveProductFallbackImage } from "@/lib/productMedia";
import { CustomerSearchAutocomplete } from "@/components/nutrix/CustomerSearchAutocomplete";

const timeStyles: Record<string, { cls: string; icon: string }> = {
  Morning: { cls: "text-amber-700 bg-amber-50 border-amber-200", icon: "☀️" },
  Afternoon: { cls: "text-orange-700 bg-orange-50 border-orange-200", icon: "🌤️" },
  Evening: { cls: "text-rose-700 bg-rose-50 border-rose-200", icon: "🌆" },
  Night: { cls: "text-indigo-700 bg-indigo-50 border-indigo-200", icon: "🌙" },
  Anytime: { cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: "⏱️" },
};

const timeFilters = ["All times", "Morning", "Afternoon", "Evening", "Night", "Anytime"];

const Shop = () => {
  const { products, addToCart, toggleWishlist, isWishlisted } = useCommerce();
  const [params, setParams] = useSearchParams();
  const initialCategory = params.get("category") || "All";
  const [active, setActive] = useState(initialCategory);
  const [activeTime, setActiveTime] = useState("All times");
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const highlightRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = "Shop by Product · Nutrix";
  }, []);

  // Sync state when URL query changes (deep link from Nutrients page or Hero carousel)
  useEffect(() => {
    const nextQ = params.get("q") ?? "";
    setQ(nextQ);
    const nextCat = params.get("category");
    if (nextCat) {
      setActive(nextCat);
    } else if (!params.has("category") && active !== "All") {
      setActive("All");
    }
    if (nextQ) {
      // Auto-scroll to first matching product after render
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }
  }, [params]);

  const list = useMemo(() => {
    let res = active === "All" ? products : products.filter((p) => p.category === active);
    if (activeTime !== "All times") res = res.filter((p) => p.bestTime === activeTime);
    if (!q.trim()) return res;
    const needle = q.toLowerCase();
    return res.filter((p) => p.name.toLowerCase().includes(needle) || p.category.toLowerCase().includes(needle) || p.form.toLowerCase().includes(needle));
  }, [active, activeTime, q]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category))).sort()], [products]);

  const clearQuery = () => {
    setQ("");
    const next = new URLSearchParams(params);
    next.delete("q");
    setParams(next, { replace: true });
  };

  return (
    <Layout>
      <PageHero
        eyebrow="The catalogue"
        title={<>Every formula. <em className="font-light">One transparent shelf.</em></>}
        sub="Browse the entire Nutrix system — powders, softgels, tablets, foods. Filter by category, sort by what your body needs."
        image={hero}
      />
      <section className="py-12 md:py-16 bg-background">
        <div className="container-tight">
          {/* Shop Search Bar with Autocomplete */}
          <div className="mb-6 max-w-xl">
            <CustomerSearchAutocomplete
              placeholder="Search catalogue by formula name, category, or benefit…"
              onSelectProduct={(p) => {
                setQ(p.name);
                const next = new URLSearchParams(params);
                next.set("q", p.name);
                setParams(next, { replace: true });
              }}
            />
          </div>

          {q && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-leaf/30 bg-leaf/10 px-5 py-3 animate-fade-up">
              <p className="text-sm text-forest">
                Showing results for <span className="font-serif text-primary">"{q}"</span> — linked from the Nutrient Library.
              </p>
              <button onClick={clearQuery} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:text-forest">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-none">
            <Filter className="w-4 h-4 text-leaf shrink-0" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setActive(c);
                  const next = new URLSearchParams(params);
                  if (c === "All") {
                    next.delete("category");
                  } else {
                    next.set("category", c);
                  }
                  setParams(next, { replace: true });
                }}
                className={`shrink-0 px-4 h-9 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  active === c
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-dew text-primary hover:bg-mist"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase tracking-[0.16em] text-leaf font-semibold shrink-0">Best time</span>
            {timeFilters.map((t) => {
              const sel = activeTime === t;
              const style = t !== "All times" ? timeStyles[t] : undefined;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTime(t)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium border transition-all ${
                    sel
                      ? "bg-primary text-primary-foreground border-primary shadow-soft"
                      : style
                        ? `${style.cls} hover:opacity-80`
                        : "bg-dew text-primary border-mist hover:bg-mist"
                  }`}
                >
                  {style && <span aria-hidden>{style.icon}</span>}
                  {t}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {list.map((p, i) => {
              const isMatch = q.trim() && p.name.toLowerCase() === q.trim().toLowerCase();
              return (
                <article
                  key={p.id}
                  ref={isMatch && !highlightRef.current ? (el) => { highlightRef.current = el; } : undefined}
                  className={`group animate-fade-up ${isMatch ? "ring-2 ring-leaf rounded-3xl p-2 -m-2 bg-leaf/5" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-soft group-hover:shadow-card transition-all">
                    <img
                      src={resolveProductImage(p)}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = resolveProductFallbackImage(p);
                      }}
                    />
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border backdrop-blur-sm ${timeStyles[p.bestTime].cls}`}>
                      <span aria-hidden>{timeStyles[p.bestTime].icon}</span> {p.bestTime}
                    </span>
                    <button onClick={() => toggleWishlist(p.id)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/85 backdrop-blur flex items-center justify-center hover:bg-background">
                      <Heart className={`w-4 h-4 ${isWishlisted(p.id) ? "fill-destructive text-destructive" : "text-primary"}`} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <button onClick={() => addToCart(p)} className="w-full h-10 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-forest inline-flex items-center justify-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to cart
                      </button>
                    </div>
                  </div>
                  <div className="pt-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-leaf font-semibold">{p.category}</p>
                    <h3 className="font-serif text-base text-primary mt-1 leading-snug line-clamp-2 min-h-[40px]">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{p.form}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-leaf text-leaf" />
                      <span className="text-primary font-medium">{p.rating}</span>
                      <span>· {p.reviews}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="font-serif text-lg text-primary">₹{p.price}</span>
                      <span className="text-xs text-muted-foreground line-through">₹{p.mrp}</span>
                    </div>
                  </div>
                </article>
              );
            })}
            {list.length === 0 && (
              <div className="col-span-full p-12 text-center text-muted-foreground rounded-2xl border border-border bg-card">
                <Search className="w-8 h-8 mx-auto mb-3 text-leaf" />
                No products matched "{q}". Try clearing the filter.
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
