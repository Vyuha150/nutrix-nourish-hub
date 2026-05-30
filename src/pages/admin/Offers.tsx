import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminApi, inr } from "@/lib/api";
import type { OfferRecord, ProductRecord } from "@/lib/types";
import { toast } from "sonner";

const empty: OfferRecord = {
  id: "",
  productId: "",
  title: "",
  description: "",
  badge: "HOT",
  wasPrice: 0,
  nowPrice: 0,
  discountPercent: 0,
  active: true,
  sortOrder: 0,
};

const Offers = () => {
  useEffect(() => { document.title = "Hot Offers · Nutrix Admin"; }, []);
  const [items, setItems] = useState<OfferRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [editing, setEditing] = useState<OfferRecord | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [offers, catalog] = await Promise.all([adminApi.listOffers(), adminApi.listProducts()]);
    setItems(offers);
    setProducts(catalog);
  };

  useEffect(() => {
    load().catch((error) => console.error(error));
  }, []);

  const onSave = async (offer: OfferRecord) => {
    try {
      if (!offer.productId.trim()) {
        toast.error("Select a product");
        return;
      }

      const payload = { ...offer };
      if (offer.id) {
        const updated = await adminApi.updateOffer(offer.id, payload);
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success("Offer updated");
      } else {
        const created = await adminApi.createOffer(payload);
        setItems((prev) => [created, ...prev]);
        toast.success("Offer created");
      }
      setOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast.error(error.message || String(error));
    }
  };

  const onDelete = async (offer: OfferRecord) => {
    try {
      await adminApi.deleteOffer(offer.id);
      setItems((prev) => prev.filter((item) => item.id !== offer.id));
      toast.success("Offer removed");
    } catch (error: any) {
      toast.error(error.message || String(error));
    }
  };

  return (
    <AdminLayout
      title="Hot Offers"
      description="Select catalog products and publish them as the site hot offers"
      actions={
        <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditing(empty)}>
              <Plus className="w-4 h-4 mr-1.5" /> New offer
            </Button>
          </DialogTrigger>
          <OfferDialog productOptions={products} offer={editing ?? empty} onSave={onSave} />
        </Dialog>
      }
    >
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Prices</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((offer) => {
                  const product = products.find((item) => item.id === offer.productId);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="font-medium">{offer.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{offer.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">{product?.id ?? offer.productId}</div>
                        <div className="text-xs text-muted-foreground">{product?.name ?? "Unknown product"}</div>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <div>{inr(offer.nowPrice)}</div>
                        <div className="text-muted-foreground line-through">{inr(offer.wasPrice)}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{offer.discountPercent}%</TableCell>
                      <TableCell><Badge variant="secondary">{offer.badge}</Badge></TableCell>
                      <TableCell><Badge variant={offer.active ? "default" : "outline"} className="capitalize">{offer.active ? "active" : "inactive"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(offer); setOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete {offer.title}?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(offer)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

const OfferDialog = ({ productOptions, offer, onSave }: { productOptions: ProductRecord[]; offer: OfferRecord; onSave: (offer: OfferRecord) => void }) => {
  const [value, setValue] = useState<OfferRecord>(offer);
  useEffect(() => setValue(offer), [offer]);
  const set = <K extends keyof OfferRecord>(key: K, next: OfferRecord[K]) => setValue({ ...value, [key]: next });

  const handleProductSelect = (productId: string) => {
    const product = productOptions.find((item) => item.id === productId);
    setValue((current) => ({
      ...current,
      productId,
      title: current.title || product?.name || "",
      description: current.description || product?.form || "",
      wasPrice: current.wasPrice || product?.mrp || 0,
      nowPrice: current.nowPrice || product?.price || 0,
      discountPercent: current.discountPercent || (product?.mrp && product?.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0),
    }));
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{offer.id ? "Edit offer" : "New offer"}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Product</Label>
          <Select value={value.productId} onValueChange={handleProductSelect}>
            <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
            <SelectContent>
              {productOptions.map((product) => (
                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5"><Label>Title</Label><Input value={value.title} onChange={(event) => set("title", event.target.value)} /></div>
        <div className="col-span-2 space-y-1.5"><Label>Description</Label><Input value={value.description} onChange={(event) => set("description", event.target.value)} /></div>
        <div className="space-y-1.5"><Label>Badge</Label><Input value={value.badge} onChange={(event) => set("badge", event.target.value)} /></div>
        <div className="space-y-1.5"><Label>Sort order</Label><Input type="number" value={value.sortOrder} onChange={(event) => set("sortOrder", Number(event.target.value))} /></div>
        <div className="space-y-1.5"><Label>Was price</Label><Input type="number" value={value.wasPrice} onChange={(event) => set("wasPrice", Number(event.target.value))} /></div>
        <div className="space-y-1.5"><Label>Now price</Label><Input type="number" value={value.nowPrice} onChange={(event) => set("nowPrice", Number(event.target.value))} /></div>
        <div className="space-y-1.5"><Label>Discount %</Label><Input type="number" value={value.discountPercent} onChange={(event) => set("discountPercent", Number(event.target.value))} /></div>
        <div className="space-y-1.5"><Label>Active</Label>
          <Select value={String(value.active)} onValueChange={(next) => set("active", next === "true")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter><Button onClick={() => onSave(value)}>Save</Button></DialogFooter>
    </DialogContent>
  );
};

export default Offers;
