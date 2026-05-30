import type { Db } from "mongodb";
import type {
  ChannelShare,
  CustomerRecord,
  LabReportRecord,
  OrderRecord,
  PageRecord,
  ProductRecord,
  OfferRecord,
  PromoRecord,
  RevenuePoint,
  SiteConfigRecord,
  TrafficPoint,
} from "../types";

export const revenueSeries: RevenuePoint[] = [
  { d: "Apr 14", revenue: 38200, orders: 92 },
  { d: "Apr 21", revenue: 42100, orders: 104 },
  { d: "Apr 28", revenue: 51800, orders: 128 },
  { d: "May 05", revenue: 47650, orders: 118 },
  { d: "May 12", revenue: 58430, orders: 142 },
  { d: "May 19", revenue: 62980, orders: 156 },
  { d: "May 26", revenue: 71240, orders: 178 },
  { d: "Jun 02", revenue: 68910, orders: 169 },
  { d: "Jun 09", revenue: 79650, orders: 192 },
  { d: "Jun 16", revenue: 84210, orders: 207 },
  { d: "Jun 23", revenue: 91320, orders: 224 },
  { d: "Jun 30", revenue: 98540, orders: 241 },
];

export const channelMix: ChannelShare[] = [
  { name: "Organic", value: 42 },
  { name: "Direct", value: 24 },
  { name: "Paid Social", value: 18 },
  { name: "Email", value: 11 },
  { name: "Referral", value: 5 },
];

export const trafficByPage: TrafficPoint[] = [
  { page: "/", views: 48210, conv: 4.2 },
  { page: "/shop", views: 31840, conv: 6.1 },
  { page: "/goals", views: 18420, conv: 3.4 },
  { page: "/nutrients", views: 14210, conv: 2.8 },
  { page: "/science", views: 9820, conv: 1.9 },
  { page: "/lab-reports", views: 6410, conv: 1.2 },
  { page: "/offers", views: 12840, conv: 5.7 },
];

export const productSeedData: ProductRecord[] = [
  { id: "P-001", name: "Complete Daily Foundation", category: "Daily Foundation", form: "Powder · 300g", price: 1499, mrp: 1899, stock: 248, status: "active", rating: 4.8, reviews: 218, sold30d: 412, imageKey: "powder", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-002", name: "Vitamin D3 + K2 (MK-7)", category: "Daily Foundation", form: "Tablet · 60ct", price: 449, mrp: 599, stock: 612, status: "active", rating: 4.7, reviews: 184, sold30d: 389, imageKey: "tablet", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-003", name: "Omega-3 Algal Softgel", category: "Daily Foundation", form: "Softgel · 60ct", price: 899, mrp: 1199, stock: 184, status: "active", rating: 4.9, reviews: 142, sold30d: 276, imageKey: "softgel", showcaseGroup: "best", bestTime: "Evening", featured: true },
  { id: "P-004", name: "Spirulina + Moringa Shake", category: "Meal Boosters", form: "Powder · 250g", price: 699, mrp: 899, stock: 92, status: "active", rating: 4.6, reviews: 96, sold30d: 198, imageKey: "powder", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-005", name: "Iron-Rich Ragi Powder", category: "Meal Boosters", form: "Powder · 400g", price: 399, mrp: 499, stock: 14, status: "active", rating: 4.5, reviews: 64, sold30d: 142, imageKey: "powder", showcaseGroup: "best", bestTime: "Afternoon", featured: true },
  { id: "P-006", name: "High-Protein Dosa Premix", category: "Meal Boosters", form: "Pouch · 500g", price: 349, mrp: 449, stock: 0, status: "active", rating: 4.4, reviews: 41, sold30d: 87, imageKey: "jar", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-007", name: "Fortified Chikki Bar", category: "Snacks", form: "Pack of 12", price: 599, mrp: 749, stock: 320, status: "active", rating: 4.7, reviews: 88, sold30d: 161, imageKey: "bar", showcaseGroup: "new", bestTime: "Afternoon", featured: true },
  { id: "P-008", name: "Daily Greens Drink", category: "Beverages", form: "Powder · 200g", price: 1099, mrp: 1399, stock: 76, status: "active", rating: 4.8, reviews: 71, sold30d: 134, imageKey: "powder", showcaseGroup: "new", bestTime: "Morning", featured: true },
  { id: "P-009", name: "Multivitamin (Adults)", category: "Capsules", form: "Tablet · 60ct", price: 549, mrp: 749, stock: 410, status: "active", rating: 4.7, reviews: 167, sold30d: 312, imageKey: "tablet", showcaseGroup: "new", bestTime: "Morning", featured: true },
  { id: "P-010", name: "Sleep Support Melatonin", category: "Capsules", form: "Softgel · 60ct", price: 499, mrp: 649, stock: 158, status: "draft", rating: 4.6, reviews: 92, sold30d: 0, imageKey: "softgel", showcaseGroup: "new", bestTime: "Night", featured: false },
  { id: "P-011", name: "Seed Butter Blend", category: "Toppings", form: "Jar · 250g", price: 549, mrp: 699, stock: 64, status: "active", rating: 4.8, reviews: 47, sold30d: 78, imageKey: "butter", showcaseGroup: "new", bestTime: "Anytime", featured: true },
  { id: "P-012", name: "Turmeric Latte Premix", category: "Beverages", form: "Powder · 150g", price: 449, mrp: 549, stock: 0, status: "archived", rating: 4.5, reviews: 38, sold30d: 0, imageKey: "jar", showcaseGroup: "new", bestTime: "Night", featured: false },
  { id: "P-013", name: "Roasted Seed Trail Mix", category: "Snacks", form: "Pouch · 200g", price: 299, mrp: 399, stock: 120, status: "active", rating: 4.6, reviews: 53, sold30d: 91, imageKey: "bar", showcaseGroup: "catalog", bestTime: "Anytime", featured: false },
  { id: "P-014", name: "Protein Lassi Powder", category: "Beverages", form: "Powder · 400g", price: 799, mrp: 999, stock: 98, status: "active", rating: 4.7, reviews: 21, sold30d: 62, imageKey: "powder", showcaseGroup: "catalog", bestTime: "Afternoon", featured: false },
];

export const customerSeedData: CustomerRecord[] = [
  { id: "C-1001", name: "Aanya Sharma", email: "aanya.sharma@mail.com", joined: "2024-08-12", segment: "VIP" },
  { id: "C-1002", name: "Rohan Mehta", email: "rohan.mehta@mail.com", joined: "2024-11-03", segment: "Regular" },
  { id: "C-1003", name: "Priya Iyer", email: "priya.iyer@mail.com", joined: "2025-01-22", segment: "New" },
  { id: "C-1004", name: "Arjun Kapoor", email: "arjun.kapoor@mail.com", joined: "2025-03-08", segment: "Regular" },
  { id: "C-1005", name: "Diya Nair", email: "diya.nair@mail.com", joined: "2025-04-19", segment: "At-risk" },
  { id: "C-1006", name: "Vihaan Patel", email: "vihaan.patel@mail.com", joined: "2024-12-14", segment: "VIP" },
  { id: "C-1007", name: "Saanvi Reddy", email: "saanvi.reddy@mail.com", joined: "2025-02-09", segment: "Regular" },
  { id: "C-1008", name: "Aditya Joshi", email: "aditya.joshi@mail.com", joined: "2025-03-25", segment: "New" },
];

export const pageSeedData: PageRecord[] = [
  { slug: "/", title: "Home", type: "Landing", updated: "Today", status: "published", views30d: 48210, seoDescription: "Nutrix home" },
  { slug: "/shop", title: "Shop", type: "Product", updated: "Yesterday", status: "published", views30d: 31840, seoDescription: "Catalog" },
  { slug: "/goals", title: "Goals", type: "Landing", updated: "3 days ago", status: "published", views30d: 18420, seoDescription: "Shop by goal" },
  { slug: "/nutrients", title: "Nutrient Library", type: "Editorial", updated: "1 week ago", status: "published", views30d: 14210, seoDescription: "Ingredient library" },
  { slug: "/science", title: "Science", type: "Editorial", updated: "2 weeks ago", status: "published", views30d: 9820, seoDescription: "Formulation science" },
  { slug: "/lab-reports", title: "Lab Reports", type: "Editorial", updated: "1 month ago", status: "published", views30d: 6410, seoDescription: "Testing and quality" },
  { slug: "/offers", title: "Offers", type: "Landing", updated: "Yesterday", status: "published", views30d: 12840, seoDescription: "Discounts and bundles" },
  { slug: "/stack-finder", title: "Stack Finder", type: "Landing", updated: "5 days ago", status: "draft", views30d: 0, seoDescription: "Find the right stack" },
];

export const promoSeedData: PromoRecord[] = [
  { id: "PR-01", code: "WELCOME10", description: "10% off first order", discount: "10%", used: 1284, cap: 5000, expires: "2025-12-31", active: true },
  { id: "PR-02", code: "FOUNDATION20", description: "20% off Daily Foundation", discount: "20%", used: 412, cap: 1000, expires: "2025-08-31", active: true },
  { id: "PR-03", code: "FREESHIP", description: "Free shipping above ₹999", discount: "Free shipping", used: 3210, cap: 99999, expires: "2026-01-31", active: true },
  { id: "PR-04", code: "MONSOON15", description: "Monsoon sale 15% off", discount: "15%", used: 982, cap: 1500, expires: "2025-07-15", active: false },
];

export const offerSeedData: OfferRecord[] = [
  {
    id: "OF-01",
    productId: "P-001",
    title: "Foundation Trio",
    description: "Daily foundation stack with automatic savings.",
    badge: "HOT",
    wasPrice: 3597,
    nowPrice: 2599,
    discountPercent: 28,
    active: true,
    sortOrder: 1,
  },
  {
    id: "OF-02",
    productId: "P-003",
    title: "Evening Recovery",
    description: "Omega-3 + sleep support bundle for end-of-day routines.",
    badge: "STACK",
    wasPrice: 1797,
    nowPrice: 1299,
    discountPercent: 28,
    active: true,
    sortOrder: 2,
  },
  {
    id: "OF-03",
    productId: "P-007",
    title: "Snack Sampler",
    description: "Curated snack bundle with a sharper price.",
    badge: "SAVE",
    wasPrice: 1397,
    nowPrice: 949,
    discountPercent: 32,
    active: true,
    sortOrder: 3,
  },
];

export const labReportSeedData: LabReportRecord[] = [
  { id: "LR-01", productId: "P-002", productName: "Vitamin D3 + K2 (MK-7)", lotNumber: "NTX-D3K-24091", testedOn: "12 Sep 2024", labName: "Eurofins India", potency: "100.4%", metals: "Pass", micro: "Pass", active: true },
  { id: "LR-02", productId: "P-003", productName: "Omega-3 Algal Softgel", lotNumber: "NTX-OMG-24087", testedOn: "08 Sep 2024", labName: "SGS Labs", potency: "102.1%", metals: "Pass", micro: "Pass", active: true },
  { id: "LR-03", productId: "P-001", productName: "Complete Daily Foundation", lotNumber: "NTX-CDF-24112", testedOn: "02 Sep 2024", labName: "Eurofins India", potency: "98.7%", metals: "Pass", micro: "Pass", active: true },
  { id: "LR-04", productId: "P-009", productName: "Multivitamin (Adults)", lotNumber: "NTX-MV-24077", testedOn: "30 Aug 2024", labName: "Intertek", potency: "101.3%", metals: "Pass", micro: "Pass", active: true },
  { id: "LR-05", productId: "P-010", productName: "Sleep Support Melatonin", lotNumber: "NTX-SLP-24038", testedOn: "04 Aug 2024", labName: "SGS Labs", potency: "100.7%", metals: "Pass", micro: "Pass", active: true },
];

const orderDefinitions = [
  { id: "#NX-20480", customerId: "C-1001", date: "Today, 10:24", status: "processing" as const, payment: "paid" as const, items: [{ productId: "P-001", qty: 1 }, { productId: "P-009", qty: 2 }] },
  { id: "#NX-20481", customerId: "C-1002", date: "Today, 09:11", status: "pending" as const, payment: "pending" as const, items: [{ productId: "P-004", qty: 1 }, { productId: "P-007", qty: 3 }] },
  { id: "#NX-20482", customerId: "C-1003", date: "Yesterday, 18:42", status: "shipped" as const, payment: "paid" as const, items: [{ productId: "P-003", qty: 1 }] },
  { id: "#NX-20483", customerId: "C-1004", date: "Jun 28, 14:02", status: "delivered" as const, payment: "paid" as const, items: [{ productId: "P-011", qty: 2 }] },
  { id: "#NX-20484", customerId: "C-1005", date: "Jun 27, 11:50", status: "cancelled" as const, payment: "refunded" as const, items: [{ productId: "P-008", qty: 1 }, { productId: "P-013", qty: 1 }] },
  { id: "#NX-20485", customerId: "C-1006", date: "Jun 25, 16:08", status: "delivered" as const, payment: "paid" as const, items: [{ productId: "P-002", qty: 3 }, { productId: "P-014", qty: 1 }] },
  { id: "#NX-20486", customerId: "C-1007", date: "Jun 24, 13:30", status: "processing" as const, payment: "paid" as const, items: [{ productId: "P-005", qty: 2 }] },
  { id: "#NX-20487", customerId: "C-1008", date: "Jun 23, 08:41", status: "refunded" as const, payment: "refunded" as const, items: [{ productId: "P-006", qty: 1 }, { productId: "P-010", qty: 1 }] },
] as const;

const buildOrder = (definition: (typeof orderDefinitions)[number]): OrderRecord => {
  const productLookup = Object.fromEntries(productSeedData.map((product) => [product.id, product]));
  const customer = customerSeedData.find((entry) => entry.id === definition.customerId);
  const lineItems = definition.items.map((item) => {
    const product = productLookup[item.productId];
    return {
      productId: item.productId,
      productName: product?.name ?? item.productId,
      qty: item.qty,
      price: product?.price ?? 0,
      imageKey: product?.imageKey,
    };
  });

  const total = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = lineItems.reduce((sum, item) => sum + item.qty, 0);

  return {
    id: definition.id,
    customerId: definition.customerId,
    customer: customer?.name ?? definition.customerId,
    email: customer?.email ?? "",
    date: definition.date,
    total,
    items: totalItems,
    status: definition.status,
    payment: definition.payment,
    lineItems,
  };
};

export const orderSeedData: OrderRecord[] = orderDefinitions.map(buildOrder);

export const defaultSiteConfig: SiteConfigRecord = {
  _id: "siteConfig",
  promoBar: "Free shipping above ₹999 · Use code WELCOME10 for 10% off",
  heroHeadline: "Formulated to nourish.",
  heroSubheadline:
    "Smart, transparent, clinically-dosed daily nutrition. Powders, softgels, tablets and foods — every active in the form your body actually absorbs.",
  promoMessages: [
    "Earn 1 point for every ₹1 you spend · Join Nutrix Circle",
    "Free shipping on orders over ₹999",
    "New: Daily Foundation powder — 30 actives in one scoop",
    "Third-party assayed. Lab reports on every product page.",
  ],
};

export const seedDatabase = async (db: Db) => {
  const products = db.collection<ProductRecord>("products");
  const customers = db.collection<CustomerRecord>("customers");
  const orders = db.collection<OrderRecord>("orders");
  const pages = db.collection<PageRecord>("pages");
  const promos = db.collection<PromoRecord>("promos");
  const offers = db.collection<OfferRecord>("offers");
  const labReports = db.collection<LabReportRecord>("labReports");
  const siteConfig = db.collection<SiteConfigRecord>("siteConfig");

  if ((await products.countDocuments()) === 0) {
    await products.insertMany(productSeedData.map((product) => ({ ...product, createdAt: new Date() })));
  }

  if ((await customers.countDocuments()) === 0) {
    await customers.insertMany(customerSeedData.map((customer) => ({ ...customer, createdAt: new Date() })));
  }

  if ((await orders.countDocuments()) === 0) {
    await orders.insertMany(orderSeedData.map((order) => ({ ...order, createdAt: new Date() })));
  }

  if ((await pages.countDocuments()) === 0) {
    await pages.insertMany(pageSeedData.map((page) => ({ ...page, createdAt: new Date() })));
  }

  if ((await promos.countDocuments()) === 0) {
    await promos.insertMany(promoSeedData.map((promo) => ({ ...promo, createdAt: new Date() })));
  }

  if ((await offers.countDocuments()) === 0) {
    await offers.insertMany(offerSeedData.map((offer) => ({ ...offer, createdAt: new Date() })));
  }

  if ((await labReports.countDocuments()) === 0) {
    await labReports.insertMany(labReportSeedData.map((report) => ({ ...report, createdAt: new Date() })));
  }

  if ((await siteConfig.countDocuments()) === 0) {
    await siteConfig.insertOne({ ...defaultSiteConfig, updatedAt: new Date() });
  }
};