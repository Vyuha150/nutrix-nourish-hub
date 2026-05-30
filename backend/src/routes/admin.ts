import { Router } from "express";
import { channelMix, defaultSiteConfig, revenueSeries, trafficByPage } from "../data/seed";
import { getCollection } from "../lib/mongo";
import { buildSearchFilter, normalizeDocument } from "../lib/normalize";
import type {
  CustomerRecord,
  CustomerStats,
  LabReportRecord,
  OrderListItem,
  OrderRecord,
  PageRecord,
  ProductRecord,
  OfferRecord,
  PromoRecord,
  SiteConfigRecord,
} from "../types";

export const adminRouter = Router();

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

const createKpis = (orders: OrderRecord[], customers: CustomerStats[]) => {
  const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const orderCount = orders.length;
  const customerCount = customers.length;

  return {
    revenue: { value: revenue, delta: 12.4 },
    orders: { value: orderCount, delta: 8.1 },
    customers: { value: customerCount, delta: 4.6 },
    aov: { value: orderCount ? Math.round(revenue / orderCount) : 0, delta: 3.2 },
    conversion: { value: 3.8, delta: 0.4 },
    refundRate: {
      value: orderCount ? Number(((orders.filter((order) => order.payment === "refunded").length / orderCount) * 100).toFixed(1)) : 0,
      delta: -0.3,
    },
  };
};

const loadOrders = async () => getCollection<OrderRecord>("orders").find({}).sort({ createdAt: -1 }).toArray();

const loadOffers = async () => getCollection<OfferRecord>("offers").find({}).sort({ sortOrder: 1, createdAt: -1 }).toArray();

const loadLabReports = async () => getCollection<LabReportRecord>("labReports").find({}).sort({ testedOn: -1, createdAt: -1 }).toArray();

const loadCustomerStats = async (): Promise<CustomerStats[]> => {
  const customers = await getCollection<CustomerRecord>("customers").find({}).sort({ createdAt: -1 }).toArray();
  const orders = await loadOrders();

  return customers.map((customer) => {
    const customerOrders = orders.filter((order) => order.customerId === customer.id);
    return {
      ...normalizeDocument(customer),
      orders: customerOrders.length,
      ltv: customerOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0),
      lastOrder: customerOrders[0]?.date ?? "Never",
    } as CustomerStats;
  });
};

const loadOrderList = async (): Promise<OrderListItem[]> => {
  const orders = await loadOrders();

  return orders.map((order) => ({
    ...normalizeDocument(order),
    items: order.lineItems.reduce((sum, item) => sum + item.qty, 0),
  })) as OrderListItem[];
};

adminRouter.get("/summary", async (_req, res) => {
  const [products, offers, orders, customers] = await Promise.all([
    getCollection<ProductRecord>("products").find({}).toArray(),
    loadOffers(),
    loadOrders(),
    loadCustomerStats(),
  ]);

  const topProducts = [...products]
    .sort((a, b) => Number(b.sold30d ?? 0) - Number(a.sold30d ?? 0))
    .slice(0, 5)
    .map((product) => normalizeDocument(product));

  const payload = {
    kpis: createKpis(orders, customers),
    revenueSeries,
    channelMix,
    recentOrders: (await loadOrderList()).slice(0, 6),
    topProducts: offers.length
      ? offers.slice(0, 5).map((offer) => ({
          id: offer.id,
          name: offer.title,
          category: "Hot Offer",
          form: offer.description,
          price: offer.nowPrice,
          mrp: offer.wasPrice,
          stock: 1,
          status: "active",
          rating: 0,
          reviews: 0,
          sold30d: offer.discountPercent,
          imageKey: "bar",
          showcaseGroup: "best",
          bestTime: "Anytime",
          featured: true,
          description: offer.description,
        }))
      : topProducts,
  };

  res.json(payload);
});

adminRouter.get("/analytics", async (_req, res) => {
  const products = await getCollection<ProductRecord>("products").find({}).toArray();
  const customers = await loadCustomerStats();
  const orders = await loadOrders();

  res.json({
    kpis: createKpis(orders, customers),
    revenueSeries,
    trafficByPage,
    products: products.map((product) => normalizeDocument(product)),
    customers,
  });
});

adminRouter.get("/offers", async (_req, res) => {
  const offers = await loadOffers();
  res.json(offers.map((offer) => normalizeDocument(offer)));
});

adminRouter.get("/offers/:id", async (req, res) => {
  const offer = await getCollection<OfferRecord>("offers").findOne({ id: req.params.id });
  if (!offer) {
    return res.status(404).json({ error: "Offer not found" });
  }

  res.json(normalizeDocument(offer));
});

adminRouter.post("/offers", async (req, res) => {
  const body = req.body ?? {};
  const offer: OfferRecord = {
    id: String(body.id || `OF-${Date.now()}`),
    productId: String(body.productId || ""),
    title: String(body.title || ""),
    description: String(body.description || ""),
    badge: String(body.badge || "HOT"),
    wasPrice: Number(body.wasPrice || 0),
    nowPrice: Number(body.nowPrice || 0),
    discountPercent: Number(body.discountPercent || 0),
    active: Boolean(body.active ?? true),
    sortOrder: Number(body.sortOrder || 0),
    createdAt: new Date(),
  };

  await getCollection<OfferRecord>("offers").insertOne(offer);
  res.status(201).json(normalizeDocument(offer));
});

adminRouter.put("/offers/:id", async (req, res) => {
  const changes = { ...req.body, updatedAt: new Date() };
  const result = await getCollection<OfferRecord>("offers").updateOne({ id: req.params.id }, { $set: changes });

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Offer not found" });
  }

  const offer = await getCollection<OfferRecord>("offers").findOne({ id: req.params.id });
  res.json(normalizeDocument(offer));
});

adminRouter.delete("/offers/:id", async (req, res) => {
  const result = await getCollection<OfferRecord>("offers").deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Offer not found" });
  }

  res.status(204).end();
});

adminRouter.get("/lab-reports", async (_req, res) => {
  const reports = await loadLabReports();
  res.json(reports.map(toLabReportResponse));
});

adminRouter.get("/lab-reports/:id", async (req, res) => {
  const report = await getCollection<LabReportRecord>("labReports").findOne({ id: req.params.id });
  if (!report) {
    return res.status(404).json({ error: "Lab report not found" });
  }

  res.json(toLabReportResponse(report));
});

adminRouter.post("/lab-reports", async (req, res) => {
  const body = req.body ?? {};
  const report: LabReportRecord = {
    id: String(body.id || `LR-${Date.now()}`),
    productId: String(body.productId || ""),
    productName: String(body.productName || ""),
    lotNumber: String(body.lotNumber || ""),
    testedOn: String(body.testedOn || ""),
    labName: String(body.labName || ""),
    potency: String(body.potency || ""),
    metals: String(body.metals || "Pass"),
    micro: String(body.micro || "Pass"),
    reportUrl: String(body.reportUrl || ""),
    reportFileName: body.reportFileName ? String(body.reportFileName) : undefined,
    reportFileType: body.reportFileType ? String(body.reportFileType) : undefined,
    reportFileData: body.reportFileData ? String(body.reportFileData) : undefined,
    active: Boolean(body.active ?? true),
    createdAt: new Date(),
  };

  await getCollection<LabReportRecord>("labReports").insertOne(report);
  res.status(201).json(toLabReportResponse(report));
});

adminRouter.put("/lab-reports/:id", async (req, res) => {
  const changes = { ...req.body, updatedAt: new Date() };
  const result = await getCollection<LabReportRecord>("labReports").updateOne({ id: req.params.id }, { $set: changes });

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Lab report not found" });
  }

  const report = await getCollection<LabReportRecord>("labReports").findOne({ id: req.params.id });
  res.json(report ? toLabReportResponse(report) : null);
});

adminRouter.delete("/lab-reports/:id", async (req, res) => {
  const result = await getCollection<LabReportRecord>("labReports").deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Lab report not found" });
  }

  res.status(204).end();
});

adminRouter.get("/products", async (req, res) => {
  const status = String(req.query.status ?? "all");
  const filter: Record<string, unknown> = buildSearchFilter(req.query, ["name", "category", "form", "id"]);
  if (status && status !== "all") {
    filter.status = status;
  }

  const products = await getCollection<ProductRecord>("products").find(filter).sort({ createdAt: -1 }).toArray();
  res.json(products.map((product) => normalizeDocument(product)));
});

adminRouter.get("/products/:id", async (req, res) => {
  const product = await getCollection<ProductRecord>("products").findOne({ id: req.params.id });
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(normalizeDocument(product));
});

adminRouter.post("/products", async (req, res) => {
  const body = req.body ?? {};
  const product: ProductRecord = {
    id: String(body.id || `P-${Date.now()}`),
    name: String(body.name || ""),
    category: String(body.category || "Daily Foundation"),
    form: String(body.form || ""),
    price: Number(body.price || 0),
    mrp: Number(body.mrp || 0),
    stock: Number(body.stock || 0),
    status: String(body.status || "draft") as ProductRecord["status"],
    rating: Number(body.rating || 0),
    reviews: Number(body.reviews || 0),
    sold30d: Number(body.sold30d || 0),
    imageKey: String(body.imageKey || "powder"),
    showcaseGroup: String(body.showcaseGroup || "catalog") as ProductRecord["showcaseGroup"],
    bestTime: String(body.bestTime || "Anytime"),
    featured: Boolean(body.featured ?? false),
    description: String(body.description || ""),
    createdAt: new Date(),
  };

  await getCollection<ProductRecord>("products").insertOne(product);
  res.status(201).json(normalizeDocument(product));
});

adminRouter.put("/products/:id", async (req, res) => {
  const changes = { ...req.body, updatedAt: new Date() };
  const result = await getCollection<ProductRecord>("products").updateOne({ id: req.params.id }, { $set: changes });

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  const product = await getCollection<ProductRecord>("products").findOne({ id: req.params.id });
  res.json(normalizeDocument(product));
});

adminRouter.delete("/products/:id", async (req, res) => {
  const result = await getCollection<ProductRecord>("products").deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(204).end();
});

adminRouter.get("/orders", async (req, res) => {
  const status = String(req.query.status ?? "all");
  const query = String(req.query.q ?? "").trim().toLowerCase();
  const orders = await loadOrders();

  const filtered = orders
    .filter((order) => (status === "all" ? true : order.status === status))
    .filter((order) => {
      if (!query) return true;
      return [order.id, order.customer, order.email].some((value) => value.toLowerCase().includes(query));
    });

  res.json(
    filtered.map((order) => ({
      ...normalizeDocument(order),
      items: order.lineItems.reduce((sum, item) => sum + item.qty, 0),
    }))
  );
});

adminRouter.get("/orders/:id", async (req, res) => {
  const order = await getCollection<OrderRecord>("orders").findOne({ id: req.params.id });
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(normalizeDocument(order));
});

adminRouter.put("/orders/:id", async (req, res) => {
  const changes = { ...req.body, updatedAt: new Date() };
  const result = await getCollection<OrderRecord>("orders").updateOne({ id: req.params.id }, { $set: changes });

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = await getCollection<OrderRecord>("orders").findOne({ id: req.params.id });
  res.json(normalizeDocument(order));
});

adminRouter.post("/orders", async (req, res) => {
  const body = req.body ?? {};
  const order: OrderRecord = {
    id: String(body.id || `#NX-${Date.now()}`),
    customerId: String(body.customerId || ""),
    customer: String(body.customer || ""),
    email: String(body.email || ""),
    date: String(body.date || new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })),
    total: Number(body.total || 0),
    items: Number(body.items || 0),
    status: String(body.status || "pending") as OrderRecord["status"],
    payment: String(body.payment || "pending") as OrderRecord["payment"],
    lineItems: Array.isArray(body.lineItems) ? body.lineItems : [],
    createdAt: new Date(),
  };

  await getCollection<OrderRecord>("orders").insertOne(order);
  res.status(201).json(normalizeDocument(order));
});

adminRouter.get("/customers", async (_req, res) => {
  res.json(await loadCustomerStats());
});

adminRouter.get("/customers/:id", async (req, res) => {
  const customers = await loadCustomerStats();
  const customer = customers.find((entry) => entry.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json(customer);
});

adminRouter.post("/customers", async (req, res) => {
  const body = req.body ?? {};
  const customer: CustomerRecord = {
    id: String(body.id || `C-${Date.now()}`),
    name: String(body.name || ""),
    email: String(body.email || ""),
    joined: String(body.joined || new Date().toISOString().slice(0, 10)),
    segment: String(body.segment || "New") as CustomerRecord["segment"],
    createdAt: new Date(),
  };

  await getCollection<CustomerRecord>("customers").insertOne(customer);
  res.status(201).json(normalizeDocument(customer));
});

adminRouter.put("/customers/:id", async (req, res) => {
  const changes = { ...req.body, updatedAt: new Date() };
  const result = await getCollection<CustomerRecord>("customers").updateOne({ id: req.params.id }, { $set: changes });

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const updatedOrders = await loadCustomerStats();
  const current = updatedOrders.find((entry) => entry.id === req.params.id);
  const customer = await getCollection<CustomerRecord>("customers").findOne({ id: req.params.id });
  res.json(current ?? normalizeDocument(customer));
});

adminRouter.get("/pages", async (_req, res) => {
  const pages = await getCollection<PageRecord>("pages").find({}).sort({ updatedAt: -1, createdAt: -1 }).toArray();
  res.json(pages.map((page) => normalizeDocument(page)));
});

adminRouter.post("/pages", async (req, res) => {
  const body = req.body ?? {};
  const page: PageRecord = {
    slug: String(body.slug || ""),
    title: String(body.title || ""),
    type: String(body.type || "Landing") as PageRecord["type"],
    updated: String(body.updated || "Just now"),
    status: String(body.status || "draft") as PageRecord["status"],
    views30d: Number(body.views30d || 0),
    seoDescription: String(body.seoDescription || ""),
    createdAt: new Date(),
  };

  await getCollection<PageRecord>("pages").insertOne(page);
  res.status(201).json(normalizeDocument(page));
});

adminRouter.put("/pages/:slug", async (req, res) => {
  const changes = { ...req.body, updated: String(req.body.updated ?? "Just now"), updatedAt: new Date() };
  const result = await getCollection<PageRecord>("pages").updateOne({ slug: req.params.slug }, { $set: changes });

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Page not found" });
  }

  const page = await getCollection<PageRecord>("pages").findOne({ slug: req.params.slug });
  res.json(normalizeDocument(page));
});

adminRouter.delete("/pages/:slug", async (req, res) => {
  const result = await getCollection<PageRecord>("pages").deleteOne({ slug: req.params.slug });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Page not found" });
  }

  res.status(204).end();
});

adminRouter.get("/promos", async (_req, res) => {
  const promos = await getCollection<PromoRecord>("promos").find({}).sort({ createdAt: -1 }).toArray();
  res.json(promos.map((promo) => normalizeDocument(promo)));
});

adminRouter.post("/promos", async (req, res) => {
  const body = req.body ?? {};
  const promo: PromoRecord = {
    id: String(body.id || `PR-${Date.now()}`),
    code: String(body.code || ""),
    description: String(body.description || ""),
    discount: String(body.discount || ""),
    used: Number(body.used || 0),
    cap: Number(body.cap || 0),
    expires: String(body.expires || ""),
    active: Boolean(body.active ?? true),
    createdAt: new Date(),
  };

  await getCollection<PromoRecord>("promos").insertOne(promo);
  res.status(201).json(normalizeDocument(promo));
});

adminRouter.put("/promos/:id", async (req, res) => {
  const changes = { ...req.body, updatedAt: new Date() };
  const result = await getCollection<PromoRecord>("promos").updateOne({ id: req.params.id }, { $set: changes });

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Promo not found" });
  }

  const promo = await getCollection<PromoRecord>("promos").findOne({ id: req.params.id });
  res.json(normalizeDocument(promo));
});

adminRouter.delete("/promos/:id", async (req, res) => {
  const result = await getCollection<PromoRecord>("promos").deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Promo not found" });
  }

  res.status(204).end();
});

adminRouter.get("/site-config", async (_req, res) => {
  const config = await getCollection<SiteConfigRecord>("siteConfig").findOne({ _id: "siteConfig" });
  res.json(config ?? defaultSiteConfig);
});

adminRouter.put("/site-config", async (req, res) => {
  const body = req.body ?? {};
  const changes: Partial<SiteConfigRecord> = {
    promoBar: String(body.promoBar ?? defaultSiteConfig.promoBar),
    heroHeadline: String(body.heroHeadline ?? defaultSiteConfig.heroHeadline),
    heroSubheadline: String(body.heroSubheadline ?? defaultSiteConfig.heroSubheadline),
    promoMessages: Array.isArray(body.promoMessages) ? body.promoMessages.map(String) : defaultSiteConfig.promoMessages,
    updatedAt: new Date(),
  };

  await getCollection<SiteConfigRecord>("siteConfig").updateOne({ _id: "siteConfig" }, { $set: changes }, { upsert: true });
  const config = await getCollection<SiteConfigRecord>("siteConfig").findOne({ _id: "siteConfig" });
  if (!config) {
    return res.status(500).json({ error: "Failed to save site config" });
  }

  res.json(config);
});