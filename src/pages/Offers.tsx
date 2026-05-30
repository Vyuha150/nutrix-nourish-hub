import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { Flame, Clock, Tag, ShoppingBag } from "lucide-react";
import hero from "@/assets/cat-snacks.jpg";
import { useCommerce } from "@/components/nutrix/CommerceProvider";
import { resolveProductImage } from "@/lib/productMedia";

const useCountdown = () => {
  const [t, setT] = useState({ h: 5, m: 42, s: 18 });
  useEffect(() => {
    const id = setInterval(() => {
      setT((x) => {
        let s = x.s - 1, m = x.m, h = x.h;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
};

const Offers = () => {
  const { offers, products, addToCart } = useCommerce();
  useEffect(() => { document.title = "Hot Offers · Nutrix"; }, []);
  const t = useCountdown();
  const fmt = (n: number) => String(n).padStart(2, "0");
  const deals = useMemo(
    () => offers.map((offer) => ({ ...offer, product: products.find((product) => product.id === offer.productId) })),
    [offers, products]
  );
  return (
    <Layout>
      <PageHero
        eyebrow="Limited drops"
        title={<>Stack smarter. <em className="font-light">Spend less.</em></>}
        sub="Hand-picked bundles + flash drops. Same Nutrix formulas — better economics when you commit to the system."
        image={hero}
      />

      <section className="py-12 bg-gradient-forest text-primary-foreground">
        <div className="container-tight flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-leaf">
              <Flame className="w-5 h-5 animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold">Today's Drop</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mt-2">30% off the Foundation Trio</h2>
            <p className="text-primary-foreground/75 mt-1 text-sm">Auto-applies at checkout · while stocks last</p>
          </div>
          <div className="flex gap-3">
            {[["HRS", t.h], ["MIN", t.m], ["SEC", t.s]].map(([l, n]) => (
              <div key={l as string} className="bg-primary-foreground/10 backdrop-blur border border-leaf/30 rounded-2xl p-4 min-w-[80px] text-center animate-pulse-soft">
                <div className="font-serif text-3xl text-leaf">{fmt(n as number)}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] mt-1 opacity-70">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container-tight">
          <div className="grid md:grid-cols-2 gap-6">
            {deals.map((d, i) => (
              <article
                key={d.id}
                className="group relative rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-all bg-card border border-border animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="grid grid-cols-2">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={resolveProductImage(d.product ?? { name: d.title, category: "Hot Offer", imageKey: "bar" })} alt={d.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full bg-leaf text-leaf-foreground">{d.badge}</span>
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-leaf mb-2">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">{d.discountPercent}% off</span>
                      </div>
                      <h3 className="font-serif text-2xl text-primary leading-tight">{d.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{d.description}</p>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="font-serif text-3xl text-primary">₹{d.nowPrice}</span>
                        <span className="text-sm text-muted-foreground line-through">₹{d.wasPrice}</span>
                      </div>
                      <button onClick={() => d.product && addToCart(d.product)} className="mt-4 w-full h-11 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-forest transition-colors inline-flex items-center justify-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add bundle
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-dew/60 border border-mist p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-leaf mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">Subscribe & save</span>
              </div>
              <h3 className="font-serif text-3xl text-primary">Lock 20% off, every month.</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                Pause, swap or cancel any time. Free shipping on every refill. Skip a month if your shelf is full.
              </p>
            </div>
            <button className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-forest transition-colors">
              Start a subscription
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Offers;
