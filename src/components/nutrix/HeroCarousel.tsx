import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    eyebrow: "Spring Reset · Up to 30% off",
    title: "Daily Foundation",
    sub: "Stay consistent all spring long",
    cta: "Shop the system",
    image: hero1,
  },
  {
    eyebrow: "Formulated to nourish",
    title: "Science you can feel.",
    sub: "Clinically dosed. Fully transparent.",
    cta: "Read the science",
    image: hero2,
  },
  {
    eyebrow: "New · Meal Boosters",
    title: "Slot nutrition into food.",
    sub: "Zero behavior change. Maximum density.",
    cta: "Explore boosters",
    image: hero3,
  },
];

export const HeroCarousel = () => {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="relative h-[520px] md:h-[640px]">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              i === idx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              width={1600}
              height={1024}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-primary/10" />
            <div className="container-tight relative h-full grid md:grid-cols-12 items-center gap-10">
              <div className="md:col-span-7 z-10">
                <div className="label-eyebrow mb-5 text-leaf animate-fade-up">{s.eyebrow}</div>
                <h1
                  className="font-serif text-5xl md:text-7xl leading-[1.02] text-primary-foreground animate-fade-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  {s.title}
                </h1>
                <p
                  className="mt-6 text-lg md:text-xl text-primary-foreground/85 max-w-xl animate-fade-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  {s.sub}
                </p>
                <button
                  className="mt-9 inline-flex items-center gap-2 bg-leaf hover:bg-dew text-primary font-semibold px-7 h-12 rounded-full shadow-glow transition-all hover:-translate-y-0.5 animate-fade-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  {s.cta}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-primary-foreground flex items-center justify-center transition-all z-20"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-primary-foreground flex items-center justify-center transition-all z-20"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === idx ? "bg-leaf w-10" : "bg-primary-foreground/40 w-5 hover:bg-primary-foreground/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
