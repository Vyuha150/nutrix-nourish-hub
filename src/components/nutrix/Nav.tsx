import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#philosophy", label: "Philosophy" },
  { href: "#products", label: "Products" },
  { href: "#nutrients", label: "Nutrient Library" },
  { href: "#science", label: "Science" },
];

export const Nav = () => (
  <header className="sticky top-0 z-40 backdrop-blur-md bg-background/75 border-b border-border/60">
    <div className="container-tight flex h-16 items-center justify-between">
      <a href="#top" className="flex items-center"><Logo size={32} /></a>
      <nav className="hidden md:flex items-center gap-8">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {l.label}
          </a>
        ))}
      </nav>
      <Button variant="default" size="sm" className="bg-primary hover:bg-forest text-primary-foreground rounded-full px-5">
        Shop
      </Button>
    </div>
  </header>
);
