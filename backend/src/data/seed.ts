import type { Db } from "mongodb";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
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
  UserRecord,
} from "../types";

export const revenueSeries: RevenuePoint[] = [];
export const channelMix: ChannelShare[] = [];
export const trafficByPage: TrafficPoint[] = [];

export const productSeedData: ProductRecord[] = [
  { id: "P-001", name: "Complete Daily Foundation", category: "Daily Foundation", form: "Powder · 300g", price: 1499, mrp: 1899, stock: 248, status: "active", rating: 4.8, reviews: 218, sold30d: 0, imageKey: "powder", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-002", name: "Vitamin D3 + K2 (MK-7)", category: "Daily Foundation", form: "Tablet · 60ct", price: 449, mrp: 599, stock: 612, status: "active", rating: 4.7, reviews: 184, sold30d: 0, imageKey: "tablet", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-003", name: "Omega-3 Algal Softgel", category: "Daily Foundation", form: "Softgel · 60ct", price: 899, mrp: 1199, stock: 184, status: "active", rating: 4.9, reviews: 142, sold30d: 0, imageKey: "softgel", showcaseGroup: "best", bestTime: "Evening", featured: true },
  { id: "P-004", name: "Spirulina + Moringa Shake", category: "Meal Boosters", form: "Powder · 250g", price: 699, mrp: 899, stock: 92, status: "active", rating: 4.6, reviews: 96, sold30d: 0, imageKey: "powder", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-005", name: "Iron-Rich Ragi Powder", category: "Meal Boosters", form: "Powder · 400g", price: 399, mrp: 499, stock: 14, status: "active", rating: 4.5, reviews: 64, sold30d: 0, imageKey: "powder", showcaseGroup: "best", bestTime: "Afternoon", featured: true },
  { id: "P-006", name: "High-Protein Dosa Premix", category: "Meal Boosters", form: "Pouch · 500g", price: 349, mrp: 449, stock: 0, status: "active", rating: 4.4, reviews: 41, sold30d: 0, imageKey: "jar", showcaseGroup: "best", bestTime: "Morning", featured: true },
  { id: "P-007", name: "Fortified Chikki Bar", category: "Snacks", form: "Pack of 12", price: 599, mrp: 749, stock: 320, status: "active", rating: 4.7, reviews: 88, sold30d: 0, imageKey: "bar", showcaseGroup: "new", bestTime: "Afternoon", featured: true },
  { id: "P-008", name: "Daily Greens Drink", category: "Beverages", form: "Powder · 200g", price: 1099, mrp: 1399, stock: 76, status: "active", rating: 4.8, reviews: 71, sold30d: 0, imageKey: "powder", showcaseGroup: "new", bestTime: "Morning", featured: true },
  { id: "P-009", name: "Multivitamin (Adults)", category: "Capsules", form: "Tablet · 60ct", price: 549, mrp: 749, stock: 410, status: "active", rating: 4.7, reviews: 167, sold30d: 0, imageKey: "tablet", showcaseGroup: "new", bestTime: "Morning", featured: true },
  { id: "P-010", name: "Sleep Support Melatonin", category: "Capsules", form: "Softgel · 60ct", price: 499, mrp: 649, stock: 158, status: "draft", rating: 4.6, reviews: 92, sold30d: 0, imageKey: "softgel", showcaseGroup: "new", bestTime: "Night", featured: false },
  { id: "P-011", name: "Seed Butter Blend", category: "Toppings", form: "Jar · 250g", price: 549, mrp: 699, stock: 64, status: "active", rating: 4.8, reviews: 47, sold30d: 0, imageKey: "butter", showcaseGroup: "new", bestTime: "Anytime", featured: true },
  { id: "P-012", name: "Turmeric Latte Premix", category: "Beverages", form: "Powder · 150g", price: 449, mrp: 549, stock: 0, status: "archived", rating: 4.5, reviews: 38, sold30d: 0, imageKey: "jar", showcaseGroup: "new", bestTime: "Night", featured: false },
  { id: "P-013", name: "Roasted Seed Trail Mix", category: "Snacks", form: "Pouch · 200g", price: 299, mrp: 399, stock: 120, status: "active", rating: 4.6, reviews: 53, sold30d: 0, imageKey: "bar", showcaseGroup: "catalog", bestTime: "Anytime", featured: false },
  { id: "P-014", name: "Protein Lassi Powder", category: "Beverages", form: "Powder · 400g", price: 799, mrp: 999, stock: 98, status: "active", rating: 4.7, reviews: 21, sold30d: 0, imageKey: "powder", showcaseGroup: "catalog", bestTime: "Afternoon", featured: false },
];

export const customerSeedData: CustomerRecord[] = [
  { id: "C-1001", name: "Aanya Sharma", email: "aanya.sharma@mail.com", joined: "2024-08-12", segment: "New" },
  { id: "C-1002", name: "Rohan Mehta", email: "rohan.mehta@mail.com", joined: "2024-11-03", segment: "New" },
  { id: "C-1003", name: "Priya Iyer", email: "priya.iyer@mail.com", joined: "2025-01-22", segment: "New" },
  { id: "C-1004", name: "Arjun Kapoor", email: "arjun.kapoor@mail.com", joined: "2025-03-08", segment: "New" },
  { id: "C-1005", name: "Diya Nair", email: "diya.nair@mail.com", joined: "2025-04-19", segment: "New" },
  { id: "C-1006", name: "Vihaan Patel", email: "vihaan.patel@mail.com", joined: "2024-12-14", segment: "New" },
  { id: "C-1007", name: "Saanvi Reddy", email: "saanvi.reddy@mail.com", joined: "2025-02-09", segment: "New" },
  { id: "C-1008", name: "Aditya Joshi", email: "aditya.joshi@mail.com", joined: "2025-03-25", segment: "New" },
];

export const pageSeedData: PageRecord[] = [
  { slug: "/", title: "Home", type: "Landing", updated: "Today", status: "published", views30d: 0, seoDescription: "Nutrix home" },
  { slug: "/shop", title: "Shop", type: "Product", updated: "Yesterday", status: "published", views30d: 0, seoDescription: "Catalog" },
  { slug: "/goals", title: "Goals", type: "Landing", updated: "3 days ago", status: "published", views30d: 0, seoDescription: "Shop by goal" },
  { slug: "/nutrients", title: "Nutrient Library", type: "Editorial", updated: "1 week ago", status: "published", views30d: 0, seoDescription: "Ingredient library" },
  { slug: "/science", title: "Science", type: "Editorial", updated: "2 weeks ago", status: "published", views30d: 0, seoDescription: "Formulation science" },
  { slug: "/lab-reports", title: "Lab Reports", type: "Editorial", updated: "1 month ago", status: "published", views30d: 0, seoDescription: "Testing and quality" },
  { slug: "/offers", title: "Offers", type: "Landing", updated: "Yesterday", status: "published", views30d: 0, seoDescription: "Discounts and bundles" },
  { slug: "/stack-finder", title: "Stack Finder", type: "Landing", updated: "5 days ago", status: "draft", views30d: 0, seoDescription: "Find the right stack" },
];

export const promoSeedData: PromoRecord[] = [
  { id: "PR-01", code: "WELCOME10", description: "10% off first order", discount: "10%", used: 0, cap: 5000, expires: "2025-12-31", active: true },
  { id: "PR-02", code: "FOUNDATION20", description: "20% off Daily Foundation", discount: "20%", used: 0, cap: 1000, expires: "2025-08-31", active: true },
  { id: "PR-03", code: "FREESHIP", description: "Free shipping above ₹999", discount: "Free shipping", used: 0, cap: 99999, expires: "2026-01-31", active: true },
  { id: "PR-04", code: "MONSOON15", description: "Monsoon sale 15% off", discount: "15%", used: 0, cap: 1500, expires: "2025-07-15", active: false },
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

export const orderSeedData: OrderRecord[] = [];

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

  // Existing collections and orders are strictly preserved without resetting

  // Admin seeding
  const adminEmail = env.adminEmail.trim().toLowerCase();
  const adminPassword = env.adminPassword;
  const adminName = env.adminName.trim() || "Admin";

  if (adminEmail && adminPassword) {
    const users = db.collection<UserRecord>("users");
    const existingAdmin = await users.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const now = new Date();
      const adminUser: UserRecord = {
        id: `U-ADMIN-${Date.now()}`,
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      };

      await users.insertOne(adminUser);
      console.log(`Admin user seeded: ${adminEmail}`);
    }
  }
};