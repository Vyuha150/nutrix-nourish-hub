import { Router } from "express";
import { defaultSiteConfig } from "../data/seed";
import { getCollection } from "../lib/mongo";
import { buildSearchFilter, normalizeDocument } from "../lib/normalize";
import { ensureCustomerProfileForUser } from "../lib/customerSync";
import { authenticate } from "../middleware/auth";
import { validateIndianAddress } from "../lib/pincodeValidator";
import type {
  CustomerRecord,
  LabReportRecord,
  OfferRecord,
  OrderRecord,
  PageRecord,
  ProductRecord,
  PromoRecord,
  ShipmentEvent,
  SiteConfigRecord,
  UserRecord,
  UserStateRecord,
} from "../types";

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

publicRouter.get("/users/:userId", authenticate, async (req, res) => {
  const authenticatedUserId = req.user!.userId;
  const requestedUserId = req.params.userId;

  // Prevent cross-user access: the authenticated user can only access their own state
  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ error: "Access denied" });
  }

  const state = await getCollection<UserStateRecord>("userStates").findOne({ userId: authenticatedUserId });
  if (!state) {
    return res.json({ userId: authenticatedUserId, email: "", name: "", cart: [], wishlist: [] });
  }

  res.json(normalizeDocument(state));
});

publicRouter.put("/users/:userId", authenticate, async (req, res) => {
  const authenticatedUserId = req.user!.userId;
  const requestedUserId = req.params.userId;

  // Prevent cross-user access: the authenticated user can only update their own state
  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ error: "Access denied" });
  }

  const body = req.body ?? {};
  const nextState: UserStateRecord = {
    userId: authenticatedUserId,
    email: String(body.email || ""),
    name: String(body.name || ""),
    cart: Array.isArray(body.cart) ? body.cart : [],
    wishlist: Array.isArray(body.wishlist) ? body.wishlist : [],
    updatedAt: new Date(),
  };

  await getCollection<UserStateRecord>("userStates").updateOne(
    { userId: authenticatedUserId },
    { $set: nextState, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  const state = await getCollection<UserStateRecord>("userStates").findOne({ userId: authenticatedUserId });
  if (!state) {
    return res.status(500).json({ error: "Failed to save user state" });
  }

  res.json(normalizeDocument(state));
});

publicRouter.get("/orders", authenticate, async (req, res) => {
  const authenticatedUserId = req.user!.userId;
  const user = await getCollection<UserRecord>("users").findOne({ id: authenticatedUserId });
  if (!user) {
    return res.status(401).json({ error: "Authenticated user not found" });
  }

  const customer = await ensureCustomerProfileForUser(user);
  const normEmail = (customer.email || user.email || "").toLowerCase();

  const orders = await getCollection<OrderRecord>("orders")
    .find({
      $or: [
        { customerId: customer.id },
        { customerId: user.id },
        { email: { $regex: `^${normEmail}$`, $options: "i" } },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(orders.map((o) => normalizeDocument(o)));
});

publicRouter.post("/validate-pincode", async (req, res) => {
  const { pincode, state, district, locality } = req.body ?? {};
  if (!pincode) {
    return res.status(400).json({ error: "PIN code is required." });
  }

  const result = await validateIndianAddress(
    String(pincode).trim(),
    String(state || "").trim(),
    String(district || "").trim(),
    String(locality || "").trim()
  );

  res.json(result);
});

publicRouter.get("/search-suggestions", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) {
    return res.json({ query: "", products: [] });
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const products = await getCollection<ProductRecord>("products")
    .find({
      status: "active",
      $or: [
        { name: regex },
        { category: regex },
        { form: regex },
        { description: regex },
        { id: regex },
      ],
    })
    .limit(8)
    .toArray();

  res.json({
    query: q,
    products: products.map((p) => normalizeDocument(p)),
  });
});

publicRouter.post("/orders", authenticate, async (req, res) => {
  const authenticatedUserId = req.user!.userId;
  const user = await getCollection<UserRecord>("users").findOne({ id: authenticatedUserId });
  if (!user) {
    return res.status(401).json({ error: "Authenticated user not found" });
  }

  // Ensure customer profile exists and get stable customer profile
  const customer = await ensureCustomerProfileForUser(user);

  const body = req.body ?? {};
  const rawItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  if (rawItems.length === 0) {
    return res.status(400).json({ error: "Your order must contain at least one item." });
  }

  // Prevent duplicate orders caused by repeated clicks or rapid retries within 5 seconds
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  const recentDuplicate = await getCollection<OrderRecord>("orders").findOne({
    customerId: customer.id,
    total: body.total,
    createdAt: { $gte: fiveSecondsAgo },
  });
  if (recentDuplicate) {
    return res.status(200).json(normalizeDocument(recentDuplicate));
  }

  // Validate delivery details
  const shipping = body.shippingAddress || body.deliveryDetails || {};
  const fullName = String(shipping.fullName || body.customer || customer.name || user.name || "").trim();
  const phone = String(shipping.phone || body.phone || "").trim();
  const building = String(shipping.building || "").trim();
  const street = String(shipping.street || "").trim();
  const town = String(shipping.town || shipping.city || "").trim();
  const mandal = String(shipping.mandal || "").trim();
  const district = String(shipping.district || shipping.city || "").trim();
  const state = String(shipping.state || "").trim();
  const postalCode = String(shipping.postalCode || body.postalCode || "").trim();
  const fallbackAddress = String(shipping.address || body.address || "").trim();

  if (!fullName) {
    return res.status(400).json({ error: "Delivery recipient full name is required." });
  }
  if (!phone) {
    return res.status(400).json({ error: "Delivery phone number is required." });
  }
  if (!postalCode) {
    return res.status(400).json({ error: "Delivery 6-digit Indian PIN code is required." });
  }
  if (!state) {
    return res.status(400).json({ error: "Delivery state is required." });
  }
  if (!district && !town) {
    return res.status(400).json({ error: "Delivery district or city is required." });
  }

  // Mandatory Backend Indian PIN Code and Delivery Address Validation
  const addressValidation = await validateIndianAddress(
    postalCode,
    state,
    district || town,
    town || street || building
  );

  if (!addressValidation.valid) {
    return res.status(400).json({
      error: addressValidation.errorMessage || "Invalid delivery PIN code.",
      validation: addressValidation,
    });
  }

  if (addressValidation.mismatch) {
    return res.status(400).json({
      error:
        addressValidation.mismatchReason ||
        "The PIN code you entered does not appear to match your selected locality, district or state. Please verify your address and PIN code before placing your order.",
      mismatch: true,
      details: addressValidation,
    });
  }

  // Consolidate full readable address string
  const formattedAddress = [
    building,
    street,
    mandal ? `Mandal: ${mandal}` : "",
    town,
    district !== town ? district : "",
    state,
    `PIN: ${postalCode}`,
  ]
    .filter(Boolean)
    .join(", ") || fallbackAddress || `${district}, ${state} - ${postalCode}`;

  // Validate product availability, quantities, and prices
  const productsCollection = getCollection<ProductRecord>("products");
  const validatedLineItems = [];

  for (const item of rawItems) {
    const productId = String(item.productId || "").trim();
    const qty = Math.max(1, Math.floor(Number(item.qty || 1)));

    if (!productId) {
      return res.status(400).json({ error: "Invalid product in order." });
    }

    const product = await productsCollection.findOne({ id: productId });
    if (!product) {
      return res.status(400).json({ error: `Product with ID "${productId}" not found.` });
    }

    if (product.status !== "active") {
      return res.status(400).json({ error: `"${product.name}" is not currently available for purchase.` });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        error: `Requested quantity for "${product.name}" exceeds available stock (${product.stock} available).`,
      });
    }

    validatedLineItems.push({
      productId: product.id,
      productName: product.name,
      qty,
      price: product.price,
      imageKey: item.imageKey ? String(item.imageKey) : product.imageKey,
    });
  }

  const itemsCount = validatedLineItems.reduce((sum, item) => sum + item.qty, 0);

  // Validate coupon if applied
  let discount = 0;
  const couponCode = String(body.couponCode || "").trim().toUpperCase();
  if (couponCode) {
    const promo = await getCollection<PromoRecord>("promos").findOne({ code: couponCode, active: true });
    if (promo) {
      const subtotalCalc = validatedLineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discountPercent = Number(promo.discount.replace(/[^\d.]/g, "")) || 0;
      discount = Math.round((subtotalCalc * discountPercent) / 100);
    }
  }

  const subtotal = validatedLineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = subtotal > 999 ? 0 : 99;
  const calculatedTotal = Math.max(0, subtotal - discount + shippingCost);

  // Total can match calculated total or body total
  const finalTotal = typeof body.total === "number" && body.total >= 0 ? body.total : calculatedTotal;

  // Initialize chronological shipment history tracking event
  const initialShipmentLocation = town ? `${town}, ${state || "India"}` : `${district || state || "India"}`;
  const nearestHubCandidate = addressValidation.postOffices?.[0] ? `${addressValidation.postOffices[0]} Hub` : undefined;

  const initialShipmentEvent: ShipmentEvent = {
    id: `SE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "Order Placed",
    location: initialShipmentLocation,
    district: district || town,
    nearestHub: nearestHubCandidate,
    timestamp: new Date().toISOString(),
    notes: "Order placed by customer. Awaiting payment verification.",
  };

  const order: OrderRecord = {
    id: String(body.id || `#NX-${Date.now()}`),
    customerId: customer.id,
    customer: fullName,
    email: customer.email || user.email,
    phone,
    shippingAddress: {
      fullName,
      phone,
      building,
      street,
      town,
      mandal,
      district,
      state,
      postalCode,
      address: formattedAddress,
      city: town || district,
    },
    date: String(body.date || new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })),
    total: finalTotal,
    items: itemsCount,
    status: "confirmed",
    payment: "pending", // Initial payment status is always Pending
    shipmentStatus: "Order Placed",
    shipmentLocation: initialShipmentLocation,
    shipmentDistrict: district || town,
    shipmentNearestHub: nearestHubCandidate,
    shipmentUpdatedAt: new Date(),
    shipmentHistory: [initialShipmentEvent],
    lineItems: validatedLineItems,
    couponCode: couponCode || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Persist order in MongoDB
  await getCollection<OrderRecord>("orders").insertOne(order);

  // Decrement stock for purchased products
  for (const item of validatedLineItems) {
    await productsCollection.updateOne(
      { id: item.productId },
      { $inc: { stock: -item.qty } }
    );
  }

  if (couponCode) {
    await getCollection<PromoRecord>("promos").updateOne(
      { code: couponCode },
      { $inc: { used: 1 } }
    );
  }

  res.status(201).json(normalizeDocument(order));
});