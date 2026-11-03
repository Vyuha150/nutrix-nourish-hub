import { Router } from "express";
import type { Collection } from "mongodb";
import { channelMix, defaultSiteConfig, revenueSeries, trafficByPage } from "../data/seed";
import { getCollection } from "../lib/mongo";
import { buildSearchFilter, normalizeDocument } from "../lib/normalize";
import { ensureCustomerProfileForUser, getNextCustomerId } from "../lib/customerSync";
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
  RevenuePoint,
  ShipmentEvent,
  ShipmentStatus,
  SiteConfigRecord,
  UserRecord,
  UserRole,
} from "../types";

export const adminRouter = Router();

const VALID_SHIPMENT_STATUSES: ShipmentStatus[] = [
  "Order Placed",
  "Order Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Reached Nearest Hub",
  "Out for Delivery",
  "Delivered",
  "Delivery Attempt Failed",
  "Returned",
];

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
  // Revenue correctness: Only paid orders contribute to collected revenue
  const paidOrders = orders.filter((order) => order.payment === "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const orderCount = orders.length;
  const paidCount = paidOrders.length;
  const customerCount = customers.length;
  const refundedCount = orders.filter((order) => order.payment === "refunded").length;

  return {
    revenue: { value: revenue, delta: 0 },
    orders: { value: orderCount, delta: 0 },
    customers: { value: customerCount, delta: 0 },
    aov: { value: paidCount ? Math.round(revenue / paidCount) : 0, delta: 0 },
    conversion: { value: 0, delta: 0 },
    refundRate: {
      value: orderCount ? Number(((refundedCount / orderCount) * 100).toFixed(1)) : 0,
      delta: 0,
    },
  };
};

const loadOrders = async () => getCollection<OrderRecord>("orders").find({}).sort({ createdAt: -1 }).toArray();

const loadOffers = async () => getCollection<OfferRecord>("offers").find({}).sort({ sortOrder: 1, createdAt: -1 }).toArray();

const loadLabReports = async () => getCollection<LabReportRecord>("labReports").find({}).sort({ testedOn: -1, createdAt: -1 }).toArray();

const calculateRevenueSeries = (orders: OrderRecord[]): RevenuePoint[] => {
  const days = 7;
  const series: RevenuePoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    series.push({ d: dateKey, revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const orderDateObj = order.createdAt ? new Date(order.createdAt) : new Date();
    const orderDate = orderDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const point = series.find((p) => p.d === orderDate);
    if (point) {
      if (order.payment === "paid") {
        point.revenue += Number(order.total || 0);
      }
      point.orders += 1;
    }
  }

  return series;
};

const calculateProductSales = (orders: OrderRecord[], products: ProductRecord[]): ProductRecord[] => {
  const salesMap = new Map<string, number>();
  for (const order of orders) {
    if (order.payment === "paid") {
      for (const item of order.lineItems || []) {
        if (item.productId) {
          salesMap.set(item.productId, (salesMap.get(item.productId) || 0) + Number(item.qty || 0));
        }
      }
    }
  }

  return products.map((p) => {
    const norm = normalizeDocument(p) as ProductRecord;
    return {
      ...norm,
      sold30d: salesMap.get(norm.id) || 0,
    };
  });
};

const loadCustomerStats = async (): Promise<CustomerStats[]> => {
  const customers = await getCollection<CustomerRecord>("customers").find({}).sort({ createdAt: -1 }).toArray();
  const orders = await loadOrders();
  const users = await getCollection<UserRecord>("users").find({}).toArray();

  const userMapByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
  const userMapById = new Map(users.map((u) => [u.id, u]));

  return customers.map((customer) => {
    const normEmail = (customer.email || "").toLowerCase();
    const linkedUser = (customer.userId ? userMapById.get(customer.userId) : null) ?? userMapByEmail.get(normEmail);
    const effectiveUserId = customer.userId || linkedUser?.id;

    const customerOrders = orders.filter(
      (order) =>
        order.customerId === customer.id ||
        (effectiveUserId && order.customerId === effectiveUserId) ||
        (order.email && order.email.toLowerCase() === normEmail)
    );

    const orderCount = customerOrders.length;
    const ltv = customerOrders
      .filter((order) => order.payment === "paid")
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const lastOrder = orderCount > 0 ? (customerOrders[0]?.date ?? "—") : "—";

    let segment: CustomerRecord["segment"] = "New";
    if (orderCount >= 3 || ltv >= 5000) {
      segment = "VIP";
    } else if (orderCount >= 1) {
      segment = "Regular";
    }

    return {
      ...normalizeDocument(customer),
      userId: effectiveUserId,
      isRegistered: Boolean(linkedUser),
      orders: orderCount,
      ltv,
      lastOrder,
      segment,
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
  const [rawProducts, _offers, orders, customers] = await Promise.all([
    getCollection<ProductRecord>("products").find({}).toArray(),
    loadOffers(),
    loadOrders(),
    loadCustomerStats(),
  ]);

  const products = calculateProductSales(orders, rawProducts);
  const revenueSeries = calculateRevenueSeries(orders);
  const recentOrders = (await loadOrderList()).slice(0, 6);

  const topProducts = [...products]
    .filter((p) => (p.sold30d || 0) > 0)
    .sort((a, b) => Number(b.sold30d ?? 0) - Number(a.sold30d ?? 0))
    .slice(0, 5)
    .map((product) => normalizeDocument(product));

  const payload = {
    kpis: createKpis(orders, customers),
    revenueSeries,
    channelMix: [],
    recentOrders,
    topProducts,
  };

  res.json(payload);
});

adminRouter.get("/analytics", async (_req, res) => {
  const [rawProducts, customers, orders] = await Promise.all([
    getCollection<ProductRecord>("products").find({}).toArray(),
    loadCustomerStats(),
    loadOrders(),
  ]);

  const products = calculateProductSales(orders, rawProducts);
  const revenueSeries = calculateRevenueSeries(orders);

  const orderStatusSummary = {
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    refunded: orders.filter((o) => o.status === "refunded").length,
  };

  const paymentStatusSummary = {
    paid: {
      count: orders.filter((o) => o.payment === "paid").length,
      total: orders.filter((o) => o.payment === "paid").reduce((s, o) => s + Number(o.total || 0), 0),
    },
    pending: {
      count: orders.filter((o) => o.payment === "pending").length,
      total: orders.filter((o) => o.payment === "pending").reduce((s, o) => s + Number(o.total || 0), 0),
    },
    failed: {
      count: orders.filter((o) => o.payment === "failed").length,
      total: orders.filter((o) => o.payment === "failed").reduce((s, o) => s + Number(o.total || 0), 0),
    },
    refunded: {
      count: orders.filter((o) => o.payment === "refunded").length,
      total: orders.filter((o) => o.payment === "refunded").reduce((s, o) => s + Number(o.total || 0), 0),
    },
  };

  res.json({
    kpis: createKpis(orders, customers),
    revenueSeries,
    trafficByPage: [],
    products: products.map((product) => normalizeDocument(product)),
    customers,
    orderStatusSummary,
    paymentStatusSummary,
    reportingPeriod: "Last 30 days",
    generatedAt: new Date().toISOString(),
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

/**
 * Formats a sequential product number with 3 digits for numbers < 100
 * Examples: 1 -> P-001, 9 -> P-009, 10 -> P-010, 99 -> P-099, 100 -> P-100, 101 -> P-101
 */
export const formatProductSku = (num: number): string => {
  if (num < 100) {
    return `P-${String(num).padStart(3, "0")}`;
  }
  return `P-${num}`;
};

/**
 * Determines the next available sequential SKU based on the highest existing sequential SKU in MongoDB.
 * Ignores old/non-sequential timestamp SKUs (e.g. 13-digit numbers >= 1,000,000).
 * Prevents any duplicates by incrementing until an unused SKU is found.
 */
export const getNextProductSku = async (productsCollection: Collection<ProductRecord>): Promise<string> => {
  const allProducts = await productsCollection.find({}, { projection: { id: 1 } }).toArray();

  let maxSeq = 0;
  const existingIds = new Set<string>();

  for (const p of allProducts) {
    if (!p.id) continue;
    existingIds.add(p.id);

    const match = p.id.match(/^P-(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      // Legitimate sequence numbers are positive integers under 1,000,000
      // Ignore large timestamp-based values like P-1791292908815
      if (!isNaN(num) && num > 0 && num < 1_000_000) {
        if (num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  let nextNum = maxSeq + 1;
  let candidateSku = formatProductSku(nextNum);

  while (existingIds.has(candidateSku)) {
    nextNum++;
    candidateSku = formatProductSku(nextNum);
  }

  return candidateSku;
};

adminRouter.get("/products", async (req, res) => {
  const status = String(req.query.status ?? "all");
  const filter: Record<string, unknown> = buildSearchFilter(req.query, ["name", "category", "form", "id"]);
  if (status && status !== "all") {
    filter.status = status;
  }

  const [rawProducts, orders] = await Promise.all([
    getCollection<ProductRecord>("products").find(filter).toArray(),
    loadOrders(),
  ]);
  const products = calculateProductSales(orders, rawProducts);

  const parseSkuNum = (id?: string): number => {
    if (!id) return -1;
    const match = id.match(/^P-(\d+)$/i);
    if (!match || !match[1]) return -1;
    const n = parseInt(match[1], 10);
    return n > 0 && n < 1_000_000 ? n : -1;
  };

  // Sort newest first:
  // 1. Primary: createdAt DESC (newest created product appears FIRST)
  // 2. Tie-breaker / Fallback for seed products sharing identical createdAt: sequential SKU descending (e.g. P-014 before P-001)
  // 3. Fallback: string id DESC
  products.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    const seqA = parseSkuNum(a.id);
    const seqB = parseSkuNum(b.id);
    if (seqA !== seqB) {
      return seqB - seqA;
    }
    return String(b.id || "").localeCompare(String(a.id || ""));
  });

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

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    const parsed = new URL(imageUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "Image URL must be a valid HTTP or HTTPS URL" });
    }
  } catch {
    return res.status(400).json({ error: "Image URL must be a valid HTTP or HTTPS URL" });
  }

  const productsCollection = getCollection<ProductRecord>("products");
  const newSku = await getNextProductSku(productsCollection);

  const product: ProductRecord = {
    id: newSku,
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
    imageUrl,
    showcaseGroup: String(body.showcaseGroup || "catalog") as ProductRecord["showcaseGroup"],
    bestTime: String(body.bestTime || "Anytime"),
    featured: Boolean(body.featured ?? false),
    description: String(body.description || ""),
    createdAt: new Date(),
  };

  await productsCollection.insertOne(product);
  res.status(201).json(normalizeDocument(product));
});

adminRouter.put("/products/:id", async (req, res) => {
  const body = req.body ?? {};

  if (body.imageUrl !== undefined) {
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL cannot be empty" });
    }
    try {
      const parsed = new URL(imageUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return res.status(400).json({ error: "Image URL must be a valid HTTP or HTTPS URL" });
      }
    } catch {
      return res.status(400).json({ error: "Image URL must be a valid HTTP or HTTPS URL" });
    }
  }

  const changes = { ...body, updatedAt: new Date() };
  // Ensure creation timestamp and product ID/SKU are never altered during updates
  delete changes.createdAt;
  delete changes.id;
  delete changes._id;

  if (changes.imageUrl) {
    changes.imageUrl = String(changes.imageUrl).trim();
  }

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

adminRouter.put("/orders/:id/payment", async (req, res) => {
  const orderId = req.params.id;
  const ordersCollection = getCollection<OrderRecord>("orders");
  const existingOrder = await ordersCollection.findOne({ id: orderId });

  if (!existingOrder) {
    return res.status(404).json({ error: "Order not found" });
  }

  const { action, paymentReference, confirmed, note } = req.body ?? {};

  if (action === "mark_paid") {
    const ref = typeof paymentReference === "string" ? paymentReference.trim() : "";
    if (!ref) {
      return res.status(400).json({ error: "Payment reference or transaction number is required." });
    }
    if (!confirmed) {
      return res.status(400).json({
        error: "Admin confirmation that the payment has actually been received and verified is required.",
      });
    }

    const adminIdentifier = req.user?.name || req.user?.email || "Admin";
    const now = new Date();

    await ordersCollection.updateOne(
      { id: orderId },
      {
        $set: {
          payment: "paid",
          paymentReference: ref,
          paymentConfirmedBy: adminIdentifier,
          paymentConfirmedAt: now,
          paymentNote: note ? String(note).trim() : existingOrder.paymentNote,
          updatedAt: now,
        },
      }
    );

    // If order was not previously paid, increment sold30d on products
    if (existingOrder.payment !== "paid") {
      for (const item of existingOrder.lineItems || []) {
        if (item.productId && item.qty > 0) {
          await getCollection<ProductRecord>("products").updateOne(
            { id: item.productId },
            { $inc: { sold30d: item.qty } }
          );
        }
      }
    }
  } else if (action === "mark_failed") {
    const reasonNote = typeof note === "string" ? note.trim() : "";
    if (!reasonNote) {
      return res.status(400).json({ error: "A reason or note is required when marking payment as failed." });
    }

    const adminIdentifier = req.user?.name || req.user?.email || "Admin";
    const now = new Date();

    await ordersCollection.updateOne(
      { id: orderId },
      {
        $set: {
          payment: "failed",
          paymentNote: reasonNote,
          paymentFailedBy: adminIdentifier,
          paymentFailedAt: now,
          updatedAt: now,
        },
      }
    );

    // If previously paid and now marked failed, decrement sold30d
    if (existingOrder.payment === "paid") {
      for (const item of existingOrder.lineItems || []) {
        if (item.productId && item.qty > 0) {
          await getCollection<ProductRecord>("products").updateOne(
            { id: item.productId },
            { $inc: { sold30d: -item.qty } }
          );
        }
      }
    }
  } else {
    return res.status(400).json({ error: 'Invalid action. Expected "mark_paid" or "mark_failed".' });
  }

  const updated = await ordersCollection.findOne({ id: orderId });
  res.json(normalizeDocument(updated));
});

adminRouter.put("/orders/:id/shipment", async (req, res) => {
  const orderId = req.params.id;
  const ordersCollection = getCollection<OrderRecord>("orders");
  const existingOrder = await ordersCollection.findOne({ id: orderId });

  if (!existingOrder) {
    return res.status(404).json({ error: "Order not found" });
  }

  const body = req.body ?? {};
  const status = body.status || body.shipmentStatus;
  const location = body.location !== undefined ? body.location : body.shipmentLocation;
  const district = body.district !== undefined ? body.district : body.shipmentDistrict;
  const nearestHub = body.nearestHub !== undefined ? body.nearestHub : body.shipmentNearestHub;
  const carrier = body.carrier !== undefined ? body.carrier : body.shipmentCarrier;
  const trackingNumber = body.trackingNumber !== undefined ? body.trackingNumber : body.shipmentTrackingNumber;
  const estimatedDeliveryDate = body.estimatedDeliveryDate;
  const notes = body.notes;

  if (!status || !VALID_SHIPMENT_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid shipment status. Allowed statuses are: ${VALID_SHIPMENT_STATUSES.join(", ")}`,
    });
  }

  const adminIdentifier = req.user?.name || req.user?.email || "Admin";
  const now = new Date();

  const newEvent: ShipmentEvent = {
    id: `SE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status,
    location: location !== undefined ? String(location).trim() : existingOrder.shipmentLocation,
    district: district !== undefined ? String(district).trim() : existingOrder.shipmentDistrict,
    nearestHub: nearestHub !== undefined ? String(nearestHub).trim() : existingOrder.shipmentNearestHub,
    carrier: carrier !== undefined ? String(carrier).trim() : existingOrder.shipmentCarrier,
    trackingNumber: trackingNumber !== undefined ? String(trackingNumber).trim() : existingOrder.shipmentTrackingNumber,
    estimatedDeliveryDate: estimatedDeliveryDate !== undefined ? String(estimatedDeliveryDate).trim() : existingOrder.estimatedDeliveryDate,
    notes: notes ? String(notes).trim() : undefined,
    timestamp: now.toISOString(),
    updatedBy: adminIdentifier,
  };

  const updatedHistory = [...(existingOrder.shipmentHistory || []), newEvent];

  await ordersCollection.updateOne(
    { id: orderId },
    {
      $set: {
        shipmentStatus: status,
        shipmentLocation: newEvent.location,
        shipmentDistrict: newEvent.district,
        shipmentNearestHub: newEvent.nearestHub,
        shipmentCarrier: newEvent.carrier,
        shipmentTrackingNumber: newEvent.trackingNumber,
        estimatedDeliveryDate: newEvent.estimatedDeliveryDate,
        shipmentUpdatedAt: now,
        shipmentHistory: updatedHistory,
        updatedAt: now,
      },
    }
  );

  const updated = await ordersCollection.findOne({ id: orderId });
  res.json(normalizeDocument(updated));
});

adminRouter.get("/search-suggestions", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.json({ products: [], orders: [], customers: [] });
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const [products, orders, customers] = await Promise.all([
    getCollection<ProductRecord>("products")
      .find({
        $or: [{ name: regex }, { id: regex }, { category: regex }, { form: regex }],
      })
      .limit(5)
      .toArray(),
    getCollection<OrderRecord>("orders")
      .find({
        $or: [{ id: regex }, { customer: regex }, { email: regex }, { paymentReference: regex }],
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray(),
    getCollection<CustomerRecord>("customers")
      .find({
        $or: [{ name: regex }, { email: regex }, { id: regex }],
      })
      .limit(5)
      .toArray(),
  ]);

  res.json({
    query: q,
    products: products.map((p) => normalizeDocument(p)),
    orders: orders.map((o) => normalizeDocument(o)),
    customers: customers.map((c) => normalizeDocument(c)),
  });
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
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Customer email is required" });
  }

  const customers = getCollection<CustomerRecord>("customers");
  const existing = await customers.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Customer with this email already exists" });
  }

  const matchingUser = await getCollection<UserRecord>("users").findOne({ email });
  const nextId = await getNextCustomerId(customers);

  const customer: CustomerRecord = {
    id: String(body.id || nextId),
    userId: matchingUser?.id,
    name: String(body.name || "Customer"),
    email,
    joined: String(body.joined || new Date().toISOString().slice(0, 10)),
    segment: String(body.segment || "New") as CustomerRecord["segment"],
    createdAt: new Date(),
  };

  await customers.insertOne(customer);
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

// ─── USER ROLE MANAGEMENT ENDPOINTS ──────────────────────────────────────────

/**
 * GET /api/admin/users
 * Returns list of users with safe fields (never exposes passwordHash)
 */
adminRouter.get("/users", async (_req, res) => {
  const users = await getCollection<UserRecord>("users")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const safeUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  res.json(safeUsers);
});

/**
 * PATCH /api/admin/users/:id/role
 * Updates a user's role (customer <-> admin).
 * Protected by adminRouter's requireRole("admin").
 * Enforces last-remaining-admin protection.
 */
adminRouter.patch("/users/:id/role", async (req, res) => {
  const targetUserId = req.params.id;
  const body = req.body ?? {};
  const requestedRole = body.role as UserRole;

  // Validate requested role against UserRole
  if (!requestedRole || (requestedRole !== "customer" && requestedRole !== "admin")) {
    return res.status(400).json({ error: "Invalid role. Role must be 'customer' or 'admin'" });
  }

  const usersCollection = getCollection<UserRecord>("users");
  const targetUser = await usersCollection.findOne({ id: targetUserId });

  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // If no change needed
  if (targetUser.role === requestedRole) {
    return res.json({
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      updatedAt: targetUser.updatedAt,
    });
  }

  // Last-admin protection: If demoting an admin to customer, verify that at least one other admin exists
  if (targetUser.role === "admin" && requestedRole === "customer") {
    const adminCount = await usersCollection.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({
        error: "Cannot change role: this is the only remaining admin account.",
      });
    }
  }

  const now = new Date();
  await usersCollection.updateOne(
    { id: targetUserId },
    { $set: { role: requestedRole, updatedAt: now } }
  );

  const updatedUser = await usersCollection.findOne({ id: targetUserId });
  if (!updatedUser) {
    return res.status(500).json({ error: "Failed to fetch updated user" });
  }

  // When changing role to customer, ensure user has a linked customer profile
  if (requestedRole === "customer") {
    await ensureCustomerProfileForUser(updatedUser);
  }

  res.json({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  });
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