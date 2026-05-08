import { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  sub: string;
  image: string;
};

export const PageHero = ({ eyebrow, title, sub, image }: Props) => (
  <section className="relative overflow-hidden h-[420px] md:h-[480px]">
    <img
      src={image}
      alt=""
      width={1600}
      height={900}
      className="absolute inset-0 w-full h-full object-cover scale-105 animate-[fade-in_1s_ease-out]"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--leaf)/0.25),transparent_60%)]" />
    <div className="container-tight relative h-full flex flex-col justify-center">
      <div className="label-eyebrow text-leaf mb-4 animate-fade-up">{eyebrow}</div>
      <h1
        className="font-serif text-4xl md:text-6xl text-primary-foreground leading-[1.05] max-w-3xl animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        {title}
      </h1>
      <p
        className="mt-5 text-base md:text-lg text-primary-foreground/85 max-w-xl animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        {sub}
      </p>
    </div>
    {/* futuristic grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.07] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--leaf)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--leaf)) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  </section>
);
