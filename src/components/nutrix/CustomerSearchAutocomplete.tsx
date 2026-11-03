import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, ArrowRight, Sparkles, X } from "lucide-react";
import { getSearchSuggestions, inr } from "@/lib/api";
import type { ProductRecord } from "@/lib/types";
import { resolveProductImage, resolveProductFallbackImage } from "@/lib/productMedia";

interface CustomerSearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSelectProduct?: (product: ProductRecord) => void;
  autoFocus?: boolean;
}

export const CustomerSearchAutocomplete = ({
  placeholder = "Search formulas, nutrients, goals…",
  className = "",
  inputClassName = "",
  onSelectProduct,
  autoFocus = false,
}: CustomerSearchAutocompleteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await getSearchSuggestions(trimmed);
        setSuggestions(res.products || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Search autocomplete error:", err);
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

  const handleSelect = (product: ProductRecord) => {
    setIsOpen(false);
    setQuery("");
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/shop?q=${encodeURIComponent(product.name)}`);
    }
  };

  const handleSubmit = () => {
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (query.trim()) {
      setIsOpen(false);
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key === "ArrowDown") {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full h-11 rounded-full bg-dew text-primary placeholder:text-primary/50 pl-11 pr-10 text-sm outline-none focus:ring-2 focus:ring-leaf transition-all shadow-sm ${inputClassName}`}
        />
        {loading ? (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-leaf" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden animate-fade-in text-card-foreground">
          {suggestions.length === 0 && !loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground space-y-1">
              <p className="font-serif text-base text-primary">No formulas found for "{query}"</p>
              <p className="text-xs">Try searching for keywords like "protein", "vitamins", or "foundation".</p>
            </div>
          ) : (
            <div>
              <div className="p-2 border-b border-border/60 bg-muted/30 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-leaf" /> Matching Formulas
                </span>
                <span>{suggestions.length} results</span>
              </div>

              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                {suggestions.map((p, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 px-4 flex items-center gap-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-leaf/15" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border/80 shrink-0">
                        <img
                          src={resolveProductImage(p)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = resolveProductFallbackImage(p);
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-primary truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{p.category}</span>
                          {p.form && <span>· {p.form}</span>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-sm text-primary">{inr(p.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                onClick={handleSubmit}
                className="p-3 px-4 bg-muted/40 hover:bg-leaf/10 border-t border-border flex items-center justify-between text-xs font-semibold text-leaf cursor-pointer transition-colors"
              >
                <span>View all catalogue results for "{query}"</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
