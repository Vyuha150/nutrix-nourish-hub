import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop by Product" },
  { to: "/goals", label: "Shop by Goal" },
  { to: "/nutrients", label: "Nutrient Library" },
  { to: "/science", label: "Science" },
  { to: "/lab-reports", label: "Lab Reports" },
  { to: "/offers", label: "Hot Offers" },
  { to: "/stack-finder", label: "Find Your Stack" },
];

export const SubNav = () => (
  <div className="bg-background border-b border-border sticky top-20 z-40">
    <div className="container-tight">
      <nav className="flex items-center justify-center gap-2 md:gap-7 h-12 overflow-x-auto scrollbar-none">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `relative whitespace-nowrap text-[11px] md:text-xs font-semibold uppercase tracking-[0.14em] py-2 group transition-colors ${
                isActive ? "text-leaf" : "text-primary/80 hover:text-leaf"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {l.label}
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-0.5 bg-leaf origin-left transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  </div>
);
