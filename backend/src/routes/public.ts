import { Router } from "express";
import { defaultSiteConfig } from "../data/seed";
import { getCollection } from "../lib/mongo";
import { buildSearchFilter, normalizeDocument } from "../lib/normalize";
import type { LabReportRecord, OfferRecord, OrderRecord, PageRecord, ProductRecord, PromoRecord, SiteConfigRecord, UserStateRecord } from "../types";

export const publicRouter = Router();

type LabReportResponse = Omit<LabReportRecord, "reportFileData"> & { reportDownloadUrl: string };

const toLabReportResponse = (report: LabReportRecord): LabReportResponse => {
  const normalized = normalizeDocument(report) as LabReportRecord;
  const { reportFileData: _reportFileData, ...rest } = normalized;
  const hasDownloadableFile = Boolean(normalized.reportFileData || normalized.reportUrl);

  return {
    ...rest,
    reportDownloadUrl: hasDownloadableFile ? `/api/public/lab-reports/${report.id}/download` : "",
  };
};

publicRouter.get("/site-config", async (_req, res) => {
  const config = await getCollection<SiteConfigRecord>("siteConfig").findOne({ _id: "siteConfig" });
  res.json(config ?? defaultSiteConfig);
});

publicRouter.get("/promos", async (_req, res) => {
  const promos = await getCollection<PromoRecord>("promos").find({ active: true }).sort({ createdAt: -1 }).toArray();
  res.json(promos.map((promo) => normalizeDocument(promo)));
});

publicRouter.get("/offers", async (_req, res) => {
  const offers = await getCollection<OfferRecord>("offers").find({ active: true }).sort({ sortOrder: 1, createdAt: -1 }).toArray();
  res.json(offers.map((offer) => normalizeDocument(offer)));
});

publicRouter.get("/products", async (req, res) => {
  const status = String(req.query.status ?? "active");
  const category = String(req.query.category ?? "");
  const showcaseGroup = String(req.query.showcaseGroup ?? "");
  const filter: Record<string, unknown> = buildSearchFilter(req.query, ["name", "category", "form"]);

  if (status && status !== "all") {
    filter.status = status;
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  if (showcaseGroup) {
    filter.showcaseGroup = showcaseGroup;
  }

  const products = await getCollection<ProductRecord>("products")
    .find(filter)
    .sort({ featured: -1, sold30d: -1, createdAt: -1 })
    .toArray();

  res.json(products.map((product) => normalizeDocument(product)));
});

publicRouter.get("/products/:id", async (req, res) => {
  const product = await getCollection<ProductRecord>("products").findOne({ id: req.params.id });
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(normalizeDocument(product));
});

publicRouter.get("/pages", async (_req, res) => {
  const pages = await getCollection<PageRecord>("pages").find({ status: "published" }).sort({ updatedAt: -1, createdAt: -1 }).toArray();
  res.json(pages.map((page) => normalizeDocument(page)));
});

publicRouter.get("/lab-reports", async (_req, res) => {
  const labReports = await getCollection<LabReportRecord>("labReports").find({ active: true }).sort({ testedOn: -1, createdAt: -1 }).toArray();
  res.json(labReports.map(toLabReportResponse));
});

publicRouter.get("/lab-reports/:id/download", async (req, res) => {
  const report = await getCollection<LabReportRecord>("labReports").findOne({ id: req.params.id, active: true });
  if (!report) {
    return res.status(404).json({ error: "Lab report not found" });
  }

  if (report.reportFileData) {
    const fileBuffer = Buffer.from(report.reportFileData, "base64");
    const fileName = report.reportFileName || `${report.id}.pdf`;

    res.setHeader("Content-Type", report.reportFileType || "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    res.setHeader("Content-Length", String(fileBuffer.length));
    return res.send(fileBuffer);
  }

  if (report.reportUrl) {
    return res.redirect(report.reportUrl);
  }

  return res.status(404).json({ error: "Lab report file not available" });
});

publicRouter.get("/users/:userId", async (req, res) => {
  const state = await getCollection<UserStateRecord>("userStates").findOne({ userId: req.params.userId });
  if (!state) {
    return res.json({ userId: req.params.userId, email: "", name: "", cart: [], wishlist: [] });
  }

  res.json(normalizeDocument(state));
});

publicRouter.put("/users/:userId", async (req, res) => {
  const body = req.body ?? {};
  const nextState: UserStateRecord = {
    userId: req.params.userId,
    email: String(body.email || ""),
    name: String(body.name || ""),
    cart: Array.isArray(body.cart) ? body.cart : [],
    wishlist: Array.isArray(body.wishlist) ? body.wishlist : [],
    updatedAt: new Date(),
  };

  await getCollection<UserStateRecord>("userStates").updateOne(
    { userId: req.params.userId },
    { $set: nextState, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  const state = await getCollection<UserStateRecord>("userStates").findOne({ userId: req.params.userId });
  if (!state) {
    return res.status(500).json({ error: "Failed to save user state" });
  }

  res.json(normalizeDocument(state));
});

publicRouter.post("/orders", async (req, res) => {
  const body = req.body ?? {};
  const lineItems = Array.isArray(body.lineItems)
    ? body.lineItems.map((item: any) => ({
        productId: String(item.productId || ""),
        productName: String(item.productName || ""),
        qty: Number(item.qty || 0),
        price: Number(item.price || 0),
        imageKey: item.imageKey ? String(item.imageKey) : undefined,
      }))
    : [];
  const itemsCount = lineItems.reduce((sum: number, item: { qty: number }) => sum + item.qty, 0);

  const order: OrderRecord = {
    id: String(body.id || `#NX-${Date.now()}`),
    customerId: String(body.customerId || ""),
    customer: String(body.customer || ""),
    email: String(body.email || ""),
    date: String(body.date || new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })),
    total: Number(body.total || 0),
    items: Number(body.items || itemsCount),
    status: String(body.status || "confirmed") as OrderRecord["status"],
    payment: String(body.payment || "paid") as OrderRecord["payment"],
    lineItems,
    couponCode: String(body.couponCode || ""),
    paymentId: String(body.paymentId || ""),
    createdAt: new Date(),
  };

  await getCollection<OrderRecord>("orders").insertOne(order);
  res.status(201).json(normalizeDocument(order));
});