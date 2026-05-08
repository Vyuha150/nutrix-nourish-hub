import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="bg-background border-t border-border">
    <div className="container-tight py-14">
      <div className="grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo size={32} />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Nutrix — Formulated to nourish. Smart, transparent, daily nutrition for people who read the label.
          </p>
        </div>
        {[
          { h: "Products", l: ["Daily Foundation", "Meal Boosters", "Snacks", "Beverages", "Capsules & Tablets"] },
          { h: "Company", l: ["Science", "Sourcing", "Lab reports", "Contact"] },
        ].map((c) => (
          <div key={c.h}>
            <h4 className="font-serif text-primary mb-3">{c.h}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.l.map((x) => <li key={x}><a href="#" className="hover:text-foreground transition-colors">{x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Nutrix Nutrition. All rights reserved.</span>
        <span>Statements not evaluated for diagnosis or treatment of disease.</span>
      </div>
    </div>
  </footer>
);
