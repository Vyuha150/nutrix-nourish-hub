const links = [
  { href: "#top", label: "Home" },
  { href: "#products", label: "Shop by Product" },
  { href: "#philosophy", label: "Shop by Goal" },
  { href: "#nutrients", label: "Nutrient Library" },
  { href: "#science", label: "Science" },
  { href: "#", label: "Lab Reports" },
  { href: "#", label: "Hot Offers" },
  { href: "#", label: "Find Your Stack" },
];

export const SubNav = () => (
  <div className="bg-background border-b border-border sticky top-20 z-40">
    <div className="container-tight">
      <nav className="flex items-center justify-center gap-2 md:gap-8 h-12 overflow-x-auto scrollbar-none">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="relative whitespace-nowrap text-[11px] md:text-xs font-semibold uppercase tracking-[0.14em] text-primary/80 hover:text-leaf transition-colors py-2 group"
          >
            {l.label}
            <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-leaf scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          </a>
        ))}
      </nav>
    </div>
  </div>
);
