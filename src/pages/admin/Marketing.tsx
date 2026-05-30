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
import type { PromoRecord } from "@/lib/types";
import { getPromos, createPromo, updatePromo, deletePromo, getSiteConfig, updateSiteConfig } from "@/lib/api";
import { toast } from "sonner";

const empty: PromoRecord = { id: "", code: "", description: "", discount: "", used: 0, cap: 1000, expires: "", active: true };

const Marketing = () => {
  useEffect(() => { document.title = "Marketing · Nutrix Admin"; }, []);
  const [items, setItems] = useState<any[]>([]);
  const [promoBar, setPromoBar] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [editing, setEditing] = useState<PromoRecord | null>(null);
  const [open, setOpen] = useState(false);

  const onSave = async (p: any) => {
    try {
      if (!p.code.trim()) { toast.error("Code required"); return; }
      if (p.id) {
        const updated = await updatePromo(p.id, p);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast.success("Promo updated");
      } else {
        const created = await createPromo(p);
        setItems((prev) => [created, ...prev]);
        toast.success("Promo created");
      }
      setOpen(false); setEditing(null);
    } catch (err: any) {
      toast.error(err.message || String(err));
    }
  };

  const toggle = async (id: string) => {
    try {
      const current = items.find((i) => i.id === id);
      const updated = await updatePromo(id, { active: !current.active });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err: any) { console.error(err); }
  };
  const remove = async (p: any) => { try { await deletePromo(p.id); setItems((prev) => prev.filter((i) => i.id !== p.id)); toast.success(`Removed ${p.code}`); } catch (err: any) { toast.error(err.message || String(err)); } };

  useEffect(() => {
    (async () => {
      try {
        const [promos, siteConfig] = await Promise.all([getPromos(), getSiteConfig()]);
        setItems(promos || []);
        setPromoBar(siteConfig?.promoBar || "");
        setHeroHeadline(siteConfig?.heroHeadline || "");
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <AdminLayout title="Marketing" description="Promo bar, hero, and discount codes">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Site-wide promo bar</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Message</Label><Input value={promoBar} onChange={(e) => setPromoBar(e.target.value)} /></div>
            <div className="rounded-md bg-primary text-primary-foreground text-xs text-center py-2">{promoBar}</div>
            <Button size="sm" onClick={async () => { try { await updateSiteConfig({ promoBar }); toast.success('Promo bar updated'); } catch (err:any){ toast.error(err.message||String(err)) } }}>Save changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Hero headline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Headline</Label><Input value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} /></div>
            <p className="text-2xl font-serif text-primary">{heroHeadline}</p>
            <Button size="sm" onClick={async () => { try { await updateSiteConfig({ heroHeadline }); toast.success('Hero updated'); } catch (err:any){ toast.error(err.message||String(err)) } }}>Save changes</Button>
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

const PromoDialog = ({ promo, onSave }: { promo: PromoRecord; onSave: (p: PromoRecord) => void }) => {
  const [p, setP] = useState<PromoRecord>(promo);
  useEffect(() => setP(promo), [promo]);
  const set = <K extends keyof PromoRecord>(k: K, v: PromoRecord[K]) => setP({ ...p, [k]: v });
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
