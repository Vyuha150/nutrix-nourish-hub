import { Nav } from "@/components/nutrix/Nav";
import { Hero } from "@/components/nutrix/Hero";
import { Philosophy } from "@/components/nutrix/Philosophy";
import { Products } from "@/components/nutrix/Products";
import { Nutrients } from "@/components/nutrix/Nutrients";
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
      <Nav />
      <Hero />
      <Philosophy />
      <Products />
      <Nutrients />
      <Science />
      <Footer />
    </main>
  );
};

export default Index;
