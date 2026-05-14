import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { promos as seed, AdminPromo } from "@/lib/adminMockData";
import { toast } from "sonner";

const empty: AdminPromo = { id: "", code: "", description: "", discount: "", used: 0, cap: 1000, expires: "", active: true };

const Marketing = () => {
  useEffect(() => { document.title = "Marketing · Nutrix Admin"; }, []);
  const [items, setItems] = useState<AdminPromo[]>(seed);
  const [promoBar, setPromoBar] = useState("Free shipping above ₹999 · Use code WELCOME10 for 10% off");
  const [heroHeadline, setHeroHeadline] = useState("Formulated to nourish.");
  const [editing, setEditing] = useState<AdminPromo | null>(null);
  const [open, setOpen] = useState(false);

  const onSave = (p: AdminPromo) => {
    if (!p.code.trim()) { toast.error("Code required"); return; }
    if (editing && items.find((i) => i.id === editing.id)) {
      setItems(items.map((i) => (i.id === editing.id ? p : i)));
      toast.success("Promo updated");
    } else {
      const id = `PR-${(items.length + 1).toString().padStart(2, "0")}`;
      setItems([{ ...p, id }, ...items]);
      toast.success("Promo created");
    }
    setOpen(false); setEditing(null);
  };

  const toggle = (id: string) => setItems(items.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  const remove = (p: AdminPromo) => { setItems(items.filter((i) => i.id !== p.id)); toast.success(`Removed ${p.code}`); };

  return (
    <AdminLayout title="Marketing" description="Promo bar, hero, and discount codes">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Site-wide promo bar</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Message</Label><Input value={promoBar} onChange={(e) => setPromoBar(e.target.value)} /></div>
            <div className="rounded-md bg-primary text-primary-foreground text-xs text-center py-2">{promoBar}</div>
            <Button size="sm" onClick={() => toast.success("Promo bar updated")}>Save changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Hero headline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Headline</Label><Input value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} /></div>
            <p className="text-2xl font-serif text-primary">{heroHeadline}</p>
            <Button size="sm" onClick={() => toast.success("Hero updated")}>Save changes</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Discount codes</CardTitle>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild><Button size="sm" onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-1.5" /> New code</Button></DialogTrigger>
            <PromoDialog promo={editing ?? empty} onSave={onSave} />
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead><TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Used / Cap</TableHead>
                <TableHead>Expires</TableHead><TableHead>Active</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.code}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell><Badge variant="secondary">{p.discount}</Badge></TableCell>
                  <TableCell className="text-right text-xs">{p.used.toLocaleString()} / {p.cap.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{p.expires}</TableCell>
                  <TableCell><Switch checked={p.active} onCheckedChange={() => toggle(p.id)} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete {p.code}?</AlertDialogTitle></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(p)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

const PromoDialog = ({ promo, onSave }: { promo: AdminPromo; onSave: (p: AdminPromo) => void }) => {
  const [p, setP] = useState<AdminPromo>(promo);
  useEffect(() => setP(promo), [promo]);
  const set = <K extends keyof AdminPromo>(k: K, v: AdminPromo[K]) => setP({ ...p, [k]: v });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{promo.id ? "Edit code" : "New code"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5"><Label>Code</Label><Input value={p.code} onChange={(e) => set("code", e.target.value.toUpperCase())} /></div>
        <div className="space-y-1.5"><Label>Description</Label><Input value={p.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Discount</Label><Input value={p.discount} onChange={(e) => set("discount", e.target.value)} placeholder="10%" /></div>
          <div className="space-y-1.5"><Label>Cap</Label><Input type="number" value={p.cap} onChange={(e) => set("cap", +e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><Label>Expires</Label><Input type="date" value={p.expires} onChange={(e) => set("expires", e.target.value)} /></div>
        <div className="flex items-center gap-2"><Switch checked={p.active} onCheckedChange={(v) => set("active", v)} /><Label>Active</Label></div>
      </div>
      <DialogFooter><Button onClick={() => onSave(p)}>Save</Button></DialogFooter>
    </DialogContent>
  );
};

export default Marketing;
