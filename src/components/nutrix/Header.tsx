import { Logo } from "./Logo";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

export const Header = () => (
  <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
    <div className="container-tight h-20 grid grid-cols-12 items-center gap-6">
      <a href="#top" className="col-span-3 flex items-center">
        <Logo size={36} variant="dark" />
      </a>
      <div className="col-span-6 hidden md:block">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
          <input
            type="search"
            placeholder="Search formulas, nutrients, goals…"
            className="w-full h-11 rounded-full bg-dew text-primary placeholder:text-primary/50 pl-11 pr-5 text-sm outline-none focus:ring-2 focus:ring-leaf transition-all"
          />
        </div>
      </div>
      <div className="col-span-3 flex items-center justify-end gap-5">
        {[User, Heart, ShoppingBag].map((Icon, i) => (
          <button key={i} className="relative group">
            <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            {Icon === ShoppingBag && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-leaf text-[10px] font-semibold text-leaf-foreground flex items-center justify-center">
                0
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  </header>
);
