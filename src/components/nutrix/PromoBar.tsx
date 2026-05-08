import { useEffect, useState } from "react";

const messages = [
  "Earn 1 point for every ₹1 you spend · Join Nutrix Circle",
  "Free shipping on orders over ₹999",
  "New: Daily Foundation powder — 30 actives in one scoop",
  "Third-party assayed. Lab reports on every product page.",
];

export const PromoBar = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-primary text-primary-foreground text-xs">
      <div className="container-tight h-9 flex items-center justify-center overflow-hidden relative">
        {messages.map((m, idx) => (
          <span
            key={idx}
            className={`absolute tracking-wide transition-all duration-700 ${
              idx === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};
