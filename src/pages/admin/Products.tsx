import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, ArrowRight } from "lucide-react";
import { inr } from "@/lib/format";
import { createProduct, updateProduct, deleteProduct, getProducts } from "@/lib/api";
import { resolveProductImage, resolveProductFallbackImage } from "@/lib/productMedia";
import type { ProductRecord } from "@/lib/types";
import { toast } from "sonner";

const empty: ProductRecord = { id: "", name: "", category: "Daily Foundation", form: "", price: 0, mrp: 0, stock: 0, status: "draft", rating: 0, reviews: 0, sold30d: 0, imageKey: "powder", showcaseGroup: "catalog", bestTime: "Anytime", featured: false };

const Products = () => {
  useEffect(() => { document.title = "Products · Nutrix Admin"; }, []);
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
    }, 280);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const n = debouncedQ.toLowerCase().trim();
    return n ? items.filter((p) => p.name.toLowerCase().includes(n) || p.category.toLowerCase().includes(n) || p.id.toLowerCase().includes(n)) : items;
  }, [items, debouncedQ]);

  const suggestions = useMemo(() => {
    const n = q.toLowerCase().trim();
    if (!n) return [];
    return items
      .filter((p) => p.name.toLowerCase().includes(n) || p.category.toLowerCase().includes(n) || p.id.toLowerCase().includes(n))
      .slice(0, 6);
  }, [items, q]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[activeIndex];
      setQ(selected.name);
      setDebouncedQ(selected.name);
      setIsDropdownOpen(false);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const onSave = async (p: any) => {
    try {
      if (!p.name.trim()) { toast.error("Name is required"); return; }
      if (p.id) {
        const updated = await updateProduct(p.id, p);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast.success(`Updated ${p.name}`);
      } else {
        const created = await createProduct(p);
        setItems((prev) => [created, ...prev]);
        toast.success(`Created ${p.name}`);
      }
      setOpen(false); setEditing(null);
    } catch (err: any) {
      toast.error(err.message || String(err));
    }
  };

  const onDelete = async (p: any) => {
    try {
      await deleteProduct(p.id);
      setItems((prev) => prev.filter((i) => i.id !== p.id));
      toast.success(`Deleted ${p.name}`);
    } catch (err: any) {
      toast.error(err.message || String(err));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getProducts();
        setItems(data as any[]);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <AdminLayout
      title="Products"
      description={`${items.length} products in catalogue`}
      actions={
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-1.5" /> New product</Button>
          </DialogTrigger>
          <ProductDialog product={editing ?? empty} onSave={onSave} />
        </Dialog>
      }
    >
      <Card>
        <CardContent className="p-3 md:p-4">
          <div ref={searchBoxRef} className="relative max-w-sm mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setIsDropdownOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              className="pl-8 h-9"
            />
            {isDropdownOpen && q.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg border bg-popover text-popover-foreground shadow-md z-30 overflow-hidden text-xs max-h-72 overflow-y-auto divide-y">
                {suggestions.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setQ(p.name);
                      setDebouncedQ(p.name);
                      setIsDropdownOpen(false);
                    }}
                    className={`p-2.5 px-3 hover:bg-muted/60 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                      idx === activeIndex ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-muted border overflow-hidden shrink-0">
                        <img
                          src={resolveProductImage(p)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = resolveProductFallbackImage(p);
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span className="font-mono">{p.id}</span>
                          <span>·</span>
                          <span>{p.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold">{inr(p.price)}</div>
                      <div className="text-[10px] text-muted-foreground">Stock: {p.stock}</div>
                    </div>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <div className="p-3 text-center text-muted-foreground">No matching products found</div>
                )}
              </div>
            )}
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead><TableHead>Product</TableHead><TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead><TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Sold 30d</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md overflow-hidden bg-muted border shrink-0">
                          <img
                            src={resolveProductImage(p)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = resolveProductFallbackImage(p);
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.form}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-right">{inr(p.price)}</TableCell>
                    <TableCell className={`text-right ${p.stock === 0 ? "text-destructive font-medium" : p.stock < 20 ? "text-amber-600" : ""}`}>{p.stock}</TableCell>
                    <TableCell className="text-right">{p.sold30d}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "active" ? "default" : p.status === "draft" ? "secondary" : "outline"} className="capitalize">{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete {p.name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(p)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

const ProductDialog = ({ product, onSave }: { product: ProductRecord; onSave: (p: ProductRecord) => void }) => {
  const [p, setP] = useState<ProductRecord>(product);
  useEffect(() => setP(product), [product]);
  const set = <K extends keyof ProductRecord>(k: K, v: ProductRecord[K]) => setP({ ...p, [k]: v });

  const handleSave = () => {
    if (!p.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    const url = p.imageUrl?.trim() || "";
    if (!url) {
      toast.error("Image URL is required");
      return;
    }
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        toast.error("Image URL must be a valid HTTP or HTTPS URL");
        return;
      }
    } catch {
      toast.error("Image URL must be a valid HTTP or HTTPS URL");
      return;
    }

    onSave({ ...p, imageUrl: url });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{p.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5"><Label>Name</Label><Input value={p.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="col-span-2 space-y-1.5">
          <Label>Image URL (HTTP/HTTPS) *</Label>
          <Input
            type="url"
            value={p.imageUrl || ""}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://images.unsplash.com/... or https://example.com/product.jpg"
          />
          {p.imageUrl && (
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-lg border overflow-hidden bg-muted shrink-0">
                <img
                  src={p.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <span className="text-xs text-muted-foreground truncate">Live preview</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5"><Label>Category</Label>
          <Select value={p.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Daily Foundation", "Meal Boosters", "Snacks", "Beverages", "Capsules", "Toppings"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Form</Label><Input value={p.form} onChange={(e) => set("form", e.target.value)} placeholder="Powder · 300g" /></div>
        <div className="space-y-1.5"><Label>Price (₹)</Label><Input type="number" value={p.price} onChange={(e) => set("price", +e.target.value)} /></div>
        <div className="space-y-1.5"><Label>MRP (₹)</Label><Input type="number" value={p.mrp} onChange={(e) => set("mrp", +e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Stock</Label><Input type="number" value={p.stock} onChange={(e) => set("stock", +e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Status</Label>
          <Select value={p.status} onValueChange={(v: ProductRecord["status"]) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
    </DialogContent>
  );
};

export default Products;
