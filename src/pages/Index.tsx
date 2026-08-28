import { PromoBar } from "@/components/nutrix/PromoBar";
import { Header } from "@/components/nutrix/Header";
import { SubNav } from "@/components/nutrix/SubNav";
import { HeroCarousel } from "@/components/nutrix/HeroCarousel";
import { PromoGrid } from "@/components/nutrix/PromoGrid";
import { CategoryStrip } from "@/components/nutrix/CategoryStrip";
import { ProductShowcase } from "@/components/nutrix/ProductShowcase";
import { Philosophy } from "@/components/nutrix/Philosophy";
import { Products } from "@/components/nutrix/Products";
import { OffersTicker } from "@/components/nutrix/OffersTicker";
import { Science } from "@/components/nutrix/Science";
import { Footer } from "@/components/nutrix/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Nutrix — Formulated to nourish";
    const desc = "Smart, transparent, clinically-dosed daily nutrition. Powders, softgels, tablets and foods — every active in the form your body actually absorbs.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
    m.setAttribute('content', desc);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <PromoBar />
      <Header />
      <SubNav />
      <HeroCarousel />
      <OffersTicker />
      <PromoGrid />
      <CategoryStrip />
      <ProductShowcase />
      <Philosophy />
      <Products />
      <Science />
      <Footer />
    </main>
  );
};

export default Index;
