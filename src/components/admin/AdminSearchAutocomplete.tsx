import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Package, ShoppingCart, Users, ArrowRight, X } from "lucide-react";
import { getAdminSearchSuggestions, inr } from "@/lib/api";
import type { ProductRecord, OrderRecord, CustomerStats } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface FlatSearchItem {
  type: "product" | "order" | "customer";
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  link: string;
}

export const AdminSearchAutocomplete = ({ className = "" }: { className?: string }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    products: ProductRecord[];
    orders: OrderRecord[];
    customers: CustomerStats[];
  }>({ products: [], orders: [], customers: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ products: [], orders: [], customers: [] });
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await getAdminSearchSuggestions(trimmed);
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Admin search error:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Flattened item list for easy keyboard navigation
  const flatItems: FlatSearchItem[] = [
    ...results.products.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      subtitle: `${p.id} · ${p.category} · ${inr(p.price)}`,
      badge: p.status,
      link: `/admin/products?q=${encodeURIComponent(p.name)}`,
    })),
    ...results.orders.map((o) => ({
      type: "order" as const,
      id: o.id,
      title: `Order ${o.id}`,
      subtitle: `${o.customer} (${o.email}) · ${inr(o.total)}`,
      badge: o.payment,
      link: `/admin/orders?q=${encodeURIComponent(o.id)}`,
    })),
    ...results.customers.map((c) => ({
      type: "customer" as const,
      id: c.id,
      title: c.name,
      subtitle: `${c.email} · Orders: ${c.orders ?? 0} · LTV: ${inr(c.ltv ?? 0)}`,
      badge: c.segment,
      link: `/admin/customers?q=${encodeURIComponent(c.email || c.name)}`,
    })),
  ];

  const handleSelectItem = (item: FlatSearchItem) => {
    setIsOpen(false);
    setQuery("");
    navigate(item.link);
  };

  const handleSubmit = () => {
    if (selectedIndex >= 0 && flatItems[selectedIndex]) {
      handleSelectItem(flatItems[selectedIndex]);
    } else if (query.trim()) {
      setIsOpen(false);
      // Default to orders search if looks like an order, or products
      if (query.trim().startsWith("#") || query.trim().startsWith("NX-")) {
        navigate(`/admin/orders?q=${encodeURIComponent(query.trim())}`);
      } else {
        navigate(`/admin/products?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key === "ArrowDown") {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasAnyResults = flatItems.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && hasAnyResults) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search orders, customers, products…"
          className="w-full h-9 rounded-md border border-input bg-muted/50 pl-8 pr-8 text-xs outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-all"
        />
        {loading ? (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults({ products: [], orders: [], customers: [] });
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[340px] max-w-lg rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden text-popover-foreground animate-fade-in">
          {!hasAnyResults && !loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No matching products, orders, or customers found.
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
              {/* Products Section */}
              {results.products.length > 0 && (
                <div className="p-1.5">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-leaf" /> Products ({results.products.length})
                  </div>
                  {results.products.map((p) => {
                    const item = flatItems.find((fi) => fi.type === "product" && fi.id === p.id)!;
                    const idx = flatItems.indexOf(item);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-2 px-2.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                          {p.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <div className="p-1.5">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShoppingCart className="w-3 h-3 text-leaf" /> Orders ({results.orders.length})
                  </div>
                  {results.orders.map((o) => {
                    const item = flatItems.find((fi) => fi.type === "order" && fi.id === o.id)!;
                    const idx = flatItems.indexOf(item);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={o.id}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-2 px-2.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium font-mono truncate">{o.id}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                        </div>
                        <Badge
                          variant={o.payment === "paid" ? "default" : "secondary"}
                          className="text-[10px] capitalize shrink-0 font-normal"
                        >
                          {o.payment}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Customers Section */}
              {results.customers.length > 0 && (
                <div className="p-1.5">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-leaf" /> Customers ({results.customers.length})
                  </div>
                  {results.customers.map((c) => {
                    const item = flatItems.find((fi) => fi.type === "customer" && fi.id === c.id)!;
                    const idx = flatItems.indexOf(item);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-2 px-2.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                          {c.segment}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
