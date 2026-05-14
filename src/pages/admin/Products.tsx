import { useEffect, useMemo, useState } from "react";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { products as seed, AdminProduct, inr } from "@/lib/adminMockData";
import { toast } from "sonner";

const empty: AdminProduct = { id: "", name: "", category: "Daily Foundation", form: "", price: 0, mrp: 0, stock: 0, status: "draft", rating: 0, reviews: 0, sold30d: 0 };

const Products = () => {
  useEffect(() => { document.title = "Products · Nutrix Admin"; }, []);
  const [items, setItems] = useState<AdminProduct[]>(seed);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const n = q.toLowerCase().trim();
    return n ? items.filter((p) => p.name.toLowerCase().includes(n) || p.category.toLowerCase().includes(n) || p.id.toLowerCase().includes(n)) : items;
  }, [items, q]);

  const onSave = (p: AdminProduct) => {
    if (!p.name.trim()) { toast.error("Name is required"); return; }
    if (p.id && items.find((i) => i.id === p.id)) {
      setItems(items.map((i) => (i.id === p.id ? p : i)));
      toast.success(`Updated ${p.name}`);
    } else {
      const id = `P-${(items.length + 1).toString().padStart(3, "0")}`;
      setItems([{ ...p, id }, ...items]);
      toast.success(`Created ${p.name}`);
    }
    setOpen(false); setEditing(null);
  };

  const onDelete = (p: AdminProduct) => {
    setItems(items.filter((i) => i.id !== p.id));
    toast.success(`Deleted ${p.name}`);
  };

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
          <div className="relative max-w-sm mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
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
                    <TableCell><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.form}</div></TableCell>
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

const ProductDialog = ({ product, onSave }: { product: AdminProduct; onSave: (p: AdminProduct) => void }) => {
  const [p, setP] = useState<AdminProduct>(product);
  useEffect(() => setP(product), [product]);
  const set = <K extends keyof AdminProduct>(k: K, v: AdminProduct[K]) => setP({ ...p, [k]: v });
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{p.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5"><Label>Name</Label><Input value={p.name} onChange={(e) => set("name", e.target.value)} /></div>
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
          <Select value={p.status} onValueChange={(v: AdminProduct["status"]) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter><Button onClick={() => onSave(p)}>Save</Button></DialogFooter>
    </DialogContent>
  );
};

export default Products;
