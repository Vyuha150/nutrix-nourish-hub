import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/nutrix/Layout";
import { PageHero } from "@/components/nutrix/PageHero";
import { Heart, Star, Filter, Search, X } from "lucide-react";
import hero from "@/assets/hero-1.jpg";
import prodPowder from "@/assets/prod-powder.jpg";
import prodTablet from "@/assets/prod-tablet.jpg";
import prodSoftgel from "@/assets/prod-softgel.jpg";
import prodJar from "@/assets/prod-jar.jpg";
import prodBar from "@/assets/prod-bar.jpg";
import prodButter from "@/assets/prod-butter.jpg";

const categories = ["All", "Daily Foundation", "Meal Boosters", "Snacks", "Beverages", "Capsules", "Toppings"];

const products = [
  { name: "Complete Daily Foundation", cat: "Daily Foundation", form: "Powder · 300g", price: 1499, mrp: 1899, img: prodPowder, rating: 4.8, reviews: 218 },
  { name: "Vitamin D3 + K2 (MK-7)", cat: "Daily Foundation", form: "Tablet · 60ct", price: 449, mrp: 599, img: prodTablet, rating: 4.7, reviews: 184 },
  { name: "Omega-3 Algal Softgel", cat: "Daily Foundation", form: "Softgel · 60ct", price: 899, mrp: 1199, img: prodSoftgel, rating: 4.9, reviews: 142 },
  { name: "Spirulina + Moringa Shake", cat: "Meal Boosters", form: "Powder · 250g", price: 699, mrp: 899, img: prodPowder, rating: 4.6, reviews: 96 },
  { name: "Iron-Rich Ragi Powder", cat: "Meal Boosters", form: "Powder · 400g", price: 399, mrp: 499, img: prodPowder, rating: 4.5, reviews: 64 },
  { name: "High-Protein Dosa Premix", cat: "Meal Boosters", form: "Pouch · 500g", price: 349, mrp: 449, img: prodJar, rating: 4.4, reviews: 41 },
  { name: "Fortified Chikki Bar", cat: "Snacks", form: "Pack of 12", price: 599, mrp: 749, img: prodBar, rating: 4.7, reviews: 88 },
  { name: "Roasted Seed Trail Mix", cat: "Snacks", form: "Pouch · 200g", price: 299, mrp: 399, img: prodBar, rating: 4.6, reviews: 53 },
  { name: "Daily Greens Drink", cat: "Beverages", form: "Powder · 200g", price: 1099, mrp: 1399, img: prodPowder, rating: 4.8, reviews: 71 },
  { name: "Turmeric Latte Premix", cat: "Beverages", form: "Powder · 150g", price: 449, mrp: 549, img: prodJar, rating: 4.5, reviews: 38 },
  { name: "Multivitamin (Adults)", cat: "Capsules", form: "Tablet · 60ct", price: 549, mrp: 749, img: prodTablet, rating: 4.7, reviews: 167 },
  { name: "Sleep Support Melatonin", cat: "Capsules", form: "Softgel · 60ct", price: 499, mrp: 649, img: prodSoftgel, rating: 4.6, reviews: 92 },
  { name: "Seed Butter Blend", cat: "Toppings", form: "Jar · 250g", price: 549, mrp: 699, img: prodButter, rating: 4.8, reviews: 47 },
  { name: "Nutritional Yeast Sprinkle", cat: "Toppings", form: "Shaker · 100g", price: 299, mrp: 379, img: prodJar, rating: 4.5, reviews: 31 },
];

const Shop = () => {
  const [active, setActive] = useState("All");
  useEffect(() => {
    document.title = "Shop by Product · Nutrix";
  }, []);
  const list = active === "All" ? products : products.filter((p) => p.cat === active);

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
          <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-none">
            <Filter className="w-4 h-4 text-leaf shrink-0" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {list.map((p, i) => (
              <article
                key={p.name}
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-soft group-hover:shadow-card transition-all">
                  <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/85 backdrop-blur flex items-center justify-center hover:bg-background">
                    <Heart className="w-4 h-4 text-primary" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <button className="w-full h-10 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-forest">
                      Add to cart
                    </button>
                  </div>
                </div>
                <div className="pt-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-leaf font-semibold">{p.cat}</p>
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
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
