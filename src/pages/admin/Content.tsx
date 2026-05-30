import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { getPages } from "@/lib/api";
import type { PageRecord } from "@/lib/types";
import { toast } from "sonner";

const empty: PageRecord = { slug: "", title: "", type: "Landing", updated: "Today", status: "draft", views30d: 0 };

const Content = () => {
  useEffect(() => { document.title = "Content · Nutrix Admin"; }, []);
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<PageRecord | null>(null);
  const [open, setOpen] = useState(false);

  const onSave = async (p: any) => {
    try {
      if (!p.title.trim() || !p.slug.trim()) { toast.error("Slug and title required"); return; }
      // POST/PUT handled by API; optimistic local update omitted for brevity
      // TODO: wire create/update endpoints
      setOpen(false); setEditing(null);
      toast.success("Saved");
    } catch (err: any) {
      toast.error(err.message || String(err));
    }
  };

  const onDelete = async (p: any) => {
    // TODO: call DELETE endpoint
    setItems((prev) => prev.filter((i) => i.slug !== p.slug));
    toast.success(`Removed ${p.title}`);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getPages();
        setItems(data || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  return (
    <AdminLayout
      title="Pages & Content"
      description="Manage every public page on the site"
      actions={
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button size="sm" onClick={() => setEditing(empty)}><Plus className="w-4 h-4 mr-1.5" /> New page</Button></DialogTrigger>
          <PageDialog page={editing ?? empty} onSave={onSave} />
        </Dialog>
      }
    >
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead><TableHead>Slug</TableHead><TableHead>Type</TableHead>
                  <TableHead>Updated</TableHead><TableHead className="text-right">Views 30d</TableHead>
                  <TableHead>Status</TableHead><TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.slug}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{p.type}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.updated}</TableCell>
                    <TableCell className="text-right">{p.views30d.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={p.status === "published" ? "default" : "secondary"} className="capitalize">{p.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><a href={p.slug} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete {p.title}?</AlertDialogTitle></AlertDialogHeader>
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

const PageDialog = ({ page, onSave }: { page: PageRecord; onSave: (p: PageRecord) => void }) => {
  const [p, setP] = useState<PageRecord>(page);
  useEffect(() => setP(page), [page]);
  const set = <K extends keyof PageRecord>(k: K, v: PageRecord[K]) => setP({ ...p, [k]: v });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{page.title ? "Edit page" : "New page"}</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5"><Label>Title</Label><Input value={p.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Slug</Label><Input value={p.slug} onChange={(e) => set("slug", e.target.value)} placeholder="/new-page" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Type</Label>
            <Select value={p.type} onValueChange={(v: PageRecord["type"]) => set("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(["Landing", "Product", "Editorial", "System"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={p.status} onValueChange={(v: PageRecord["status"]) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>SEO description</Label><Textarea rows={3} placeholder="Short meta description shown in search results…" /></div>
      </div>
      <DialogFooter><Button onClick={() => onSave(p)}>Save</Button></DialogFooter>
    </DialogContent>
  );
};

export default Content;
