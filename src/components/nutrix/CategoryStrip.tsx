const cats = [
  { name: "Daily Foundation", count: 5 },
  { name: "Meal Boosters", count: 7 },
  { name: "Snacks", count: 7 },
  { name: "Beverages", count: 4 },
  { name: "Capsules", count: 5 },
  { name: "Toppings", count: 5 },
];

export const CategoryStrip = () => (
  <section className="py-14 bg-background border-y border-border">
    <div className="container-tight">
      <p className="label-eyebrow mb-6 text-center">Shop by category</p>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {cats.map((c, i) => (
          <a
            key={c.name}
            href="#products"
            className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-dew/60 transition-colors animate-fade-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-leaf flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:shadow-glow transition-all duration-500">
              <span className="font-serif text-primary text-xl">{c.name[0]}</span>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary leading-tight">{c.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{c.count} items</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);
