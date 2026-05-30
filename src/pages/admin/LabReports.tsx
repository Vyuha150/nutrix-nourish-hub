import { useEffect, useRef, useState } from "react";
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
import { Download, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { adminApi, buildApiUrl } from "@/lib/api";
import type { LabReportRecord, ProductRecord } from "@/lib/types";
import { toast } from "sonner";

const empty: LabReportRecord = {
  id: "",
  productId: "",
  productName: "",
  lotNumber: "",
  testedOn: "",
  labName: "",
  potency: "",
  metals: "Pass",
  micro: "Pass",
  reportUrl: "",
  active: true,
};

const LabReports = () => {
  useEffect(() => { document.title = "Lab Reports · Nutrix Admin"; }, []);
  const [items, setItems] = useState<LabReportRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [editing, setEditing] = useState<LabReportRecord | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [reports, catalog] = await Promise.all([adminApi.listLabReports(), adminApi.listProducts()]);
    setItems(reports);
    setProducts(catalog);
  };

  useEffect(() => {
    load().catch((error) => console.error(error));
  }, []);

  const onSave = async (report: LabReportRecord) => {
    try {
      if (!report.productId.trim() || !report.lotNumber.trim()) {
        toast.error("Product and lot number are required");
        return;
      }

      const payload = { ...report };
      if (report.id) {
        const updated = await adminApi.updateLabReport(report.id, payload);
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success("Lab report updated");
      } else {
        const created = await adminApi.createLabReport(payload);
        setItems((prev) => [created, ...prev]);
        toast.success("Lab report created");
      }
      setOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast.error(error.message || String(error));
    }
  };

  const onDelete = async (report: LabReportRecord) => {
    try {
      await adminApi.deleteLabReport(report.id);
      setItems((prev) => prev.filter((item) => item.id !== report.id));
      toast.success("Lab report removed");
    } catch (error: any) {
      toast.error(error.message || String(error));
    }
  };

  return (
    <AdminLayout
      title="Lab Reports"
      description="Edit product certificates that power the public lab report archive"
      actions={
        <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditing(empty)}>
              <Plus className="w-4 h-4 mr-1.5" /> New report
            </Button>
          </DialogTrigger>
          <LabReportDialog productOptions={products} report={editing ?? empty} onSave={onSave} />
        </Dialog>
      }
    >
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>Tested</TableHead>
                  <TableHead>Potency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium">{report.productName}</div>
                      <div className="text-xs text-muted-foreground">{report.productId}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{report.lotNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{report.labName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{report.testedOn}</TableCell>
                    <TableCell><Badge variant="secondary">{report.potency}</Badge></TableCell>
                    <TableCell><Badge variant={report.active ? "default" : "outline"} className="capitalize">{report.active ? "active" : "inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(report); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete {report.productName} report?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(report)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
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

const LabReportDialog = ({ productOptions, report, onSave }: { productOptions: ProductRecord[]; report: LabReportRecord; onSave: (report: LabReportRecord) => void }) => {
  const [value, setValue] = useState<LabReportRecord>(report);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setValue(report), [report]);
  const set = <K extends keyof LabReportRecord>(key: K, next: LabReportRecord[K]) => setValue({ ...value, [key]: next });

  const encodeFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";

    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }

    return btoa(binary);
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    const reportFileData = await encodeFile(file);
    setValue((current) => ({
      ...current,
      reportFileName: file.name,
      reportFileType: file.type || "application/pdf",
      reportFileData,
    }));
  };

  const handleProductSelect = (productId: string) => {
    const product = productOptions.find((item) => item.id === productId);
    setValue((current) => ({
      ...current,
      productId,
      productName: product?.name ?? current.productName,
    }));
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{report.id ? "Edit lab report" : "New lab report"}</DialogTitle></DialogHeader>
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
        <div className="col-span-2 space-y-1.5"><Label>Product name</Label><Input value={value.productName} onChange={(event) => set("productName", event.target.value)} /></div>
        <div className="space-y-1.5"><Label>Lot number</Label><Input value={value.lotNumber} onChange={(event) => set("lotNumber", event.target.value)} /></div>
        <div className="space-y-1.5"><Label>Tested on</Label><Input value={value.testedOn} onChange={(event) => set("testedOn", event.target.value)} placeholder="12 Sep 2024" /></div>
        <div className="space-y-1.5"><Label>Lab name</Label><Input value={value.labName} onChange={(event) => set("labName", event.target.value)} /></div>
        <div className="space-y-1.5"><Label>Potency</Label><Input value={value.potency} onChange={(event) => set("potency", event.target.value)} placeholder="100.4%" /></div>
        <div className="space-y-1.5"><Label>Metals</Label><Input value={value.metals} onChange={(event) => set("metals", event.target.value)} /></div>
        <div className="space-y-1.5"><Label>Micro</Label><Input value={value.micro} onChange={(event) => set("micro", event.target.value)} /></div>
        <div className="col-span-2 space-y-2">
          <Label>Lab report file</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={async (event) => {
              await handleFileSelect(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <div className="font-medium text-primary">Upload a PDF certificate</div>
                <div className="text-xs text-muted-foreground">
                  {value.reportFileName ? `Selected: ${value.reportFileName}` : value.reportDownloadUrl ? `Current file: ${value.reportFileName || "stored report"}` : "No file uploaded yet."}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {value.reportDownloadUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={buildApiUrl(value.reportDownloadUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download current
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Choose file
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Uploading a new file replaces the active certificate for this report. If you only change metadata, leave this empty.
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Active</Label>
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

export default LabReports;
