// Mock data for admin panel (UI-only, no persistence)

export type AdminProduct = {
  id: string;
  name: string;
  category: string;
  form: string;
  price: number;
  mrp: number;
  stock: number;
  status: "active" | "draft" | "archived";
  rating: number;
  reviews: number;
  sold30d: number;
};

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  payment: "paid" | "pending" | "refunded";
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  ltv: number;
  lastOrder: string;
  segment: "VIP" | "Regular" | "New" | "At-risk";
};

export type AdminPage = {
  slug: string;
  title: string;
  type: "Landing" | "Product" | "Editorial" | "System";
  updated: string;
  status: "published" | "draft";
  views30d: number;
};

export type AdminPromo = {
  id: string;
  code: string;
  description: string;
  discount: string;
  used: number;
  cap: number;
  expires: string;
  active: boolean;
};

export const kpis = {
  revenue: { value: 1284560, delta: 12.4 },
  orders: { value: 3284, delta: 8.1 },
  customers: { value: 9472, delta: 4.6 },
  aov: { value: 391, delta: 3.2 },
  conversion: { value: 3.8, delta: 0.4 },
  refundRate: { value: 1.2, delta: -0.3 },
};

export const revenueSeries = [
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

export const channelMix = [
  { name: "Organic", value: 42 },
  { name: "Direct", value: 24 },
  { name: "Paid Social", value: 18 },
  { name: "Email", value: 11 },
  { name: "Referral", value: 5 },
];

export const trafficByPage = [
  { page: "/", views: 48210, conv: 4.2 },
  { page: "/shop", views: 31840, conv: 6.1 },
  { page: "/goals", views: 18420, conv: 3.4 },
  { page: "/nutrients", views: 14210, conv: 2.8 },
  { page: "/science", views: 9820, conv: 1.9 },
  { page: "/lab-reports", views: 6410, conv: 1.2 },
  { page: "/offers", views: 12840, conv: 5.7 },
];

export const products: AdminProduct[] = [
  { id: "P-001", name: "Complete Daily Foundation", category: "Daily Foundation", form: "Powder · 300g", price: 1499, mrp: 1899, stock: 248, status: "active", rating: 4.8, reviews: 218, sold30d: 412 },
  { id: "P-002", name: "Vitamin D3 + K2 (MK-7)", category: "Daily Foundation", form: "Tablet · 60ct", price: 449, mrp: 599, stock: 612, status: "active", rating: 4.7, reviews: 184, sold30d: 389 },
  { id: "P-003", name: "Omega-3 Algal Softgel", category: "Daily Foundation", form: "Softgel · 60ct", price: 899, mrp: 1199, stock: 184, status: "active", rating: 4.9, reviews: 142, sold30d: 276 },
  { id: "P-004", name: "Spirulina + Moringa Shake", category: "Meal Boosters", form: "Powder · 250g", price: 699, mrp: 899, stock: 92, status: "active", rating: 4.6, reviews: 96, sold30d: 198 },
  { id: "P-005", name: "Iron-Rich Ragi Powder", category: "Meal Boosters", form: "Powder · 400g", price: 399, mrp: 499, stock: 14, status: "active", rating: 4.5, reviews: 64, sold30d: 142 },
  { id: "P-006", name: "High-Protein Dosa Premix", category: "Meal Boosters", form: "Pouch · 500g", price: 349, mrp: 449, stock: 0, status: "active", rating: 4.4, reviews: 41, sold30d: 87 },
  { id: "P-007", name: "Fortified Chikki Bar", category: "Snacks", form: "Pack of 12", price: 599, mrp: 749, stock: 320, status: "active", rating: 4.7, reviews: 88, sold30d: 161 },
  { id: "P-008", name: "Daily Greens Drink", category: "Beverages", form: "Powder · 200g", price: 1099, mrp: 1399, stock: 76, status: "active", rating: 4.8, reviews: 71, sold30d: 134 },
  { id: "P-009", name: "Multivitamin (Adults)", category: "Capsules", form: "Tablet · 60ct", price: 549, mrp: 749, stock: 410, status: "active", rating: 4.7, reviews: 167, sold30d: 312 },
  { id: "P-010", name: "Sleep Support Melatonin", category: "Capsules", form: "Softgel · 60ct", price: 499, mrp: 649, stock: 158, status: "draft", rating: 4.6, reviews: 92, sold30d: 0 },
  { id: "P-011", name: "Seed Butter Blend", category: "Toppings", form: "Jar · 250g", price: 549, mrp: 699, stock: 64, status: "active", rating: 4.8, reviews: 47, sold30d: 78 },
  { id: "P-012", name: "Turmeric Latte Premix", category: "Beverages", form: "Powder · 150g", price: 449, mrp: 549, stock: 0, status: "archived", rating: 4.5, reviews: 38, sold30d: 0 },
];

const customerNames = [
  "Aanya Sharma", "Rohan Mehta", "Priya Iyer", "Arjun Kapoor", "Diya Nair",
  "Vihaan Patel", "Saanvi Reddy", "Aditya Joshi", "Ishaan Verma", "Anika Rao",
  "Kabir Singh", "Myra Das", "Aarav Bose", "Tara Krishnan", "Reyansh Gupta",
];

export const customers: AdminCustomer[] = customerNames.map((name, i) => {
  const orders = Math.floor(2 + Math.random() * 22);
  const ltv = Math.floor(800 + Math.random() * 28000);
  const segments: AdminCustomer["segment"][] = ["VIP", "Regular", "New", "At-risk"];
  return {
    id: `C-${(1000 + i).toString()}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
    joined: ["2024-08-12", "2024-11-03", "2025-01-22", "2025-03-08", "2025-04-19"][i % 5],
    orders,
    ltv,
    lastOrder: ["2 days ago", "1 week ago", "3 weeks ago", "1 month ago", "Today"][i % 5],
    segment: ltv > 18000 ? "VIP" : orders < 4 ? "New" : i % 4 === 3 ? "At-risk" : segments[i % 4],
  };
});

const statuses: AdminOrder["status"][] = ["pending", "processing", "shipped", "delivered", "delivered", "cancelled", "refunded"];
export const orders: AdminOrder[] = Array.from({ length: 24 }).map((_, i) => {
  const customer = customers[i % customers.length];
  const items = 1 + Math.floor(Math.random() * 5);
  const total = items * (300 + Math.floor(Math.random() * 1200));
  const status = statuses[i % statuses.length];
  return {
    id: `#NX-${(20480 + i).toString()}`,
    customer: customer.name,
    email: customer.email,
    date: ["Today, 10:24", "Today, 09:11", "Yesterday, 18:42", "Jun 28, 14:02", "Jun 27, 11:50", "Jun 26, 09:30"][i % 6],
    total,
    items,
    status,
    payment: status === "refunded" ? "refunded" : status === "pending" ? "pending" : "paid",
  };
});

export const pages: AdminPage[] = [
  { slug: "/", title: "Home", type: "Landing", updated: "Today", status: "published", views30d: 48210 },
  { slug: "/shop", title: "Shop", type: "Product", updated: "Yesterday", status: "published", views30d: 31840 },
  { slug: "/goals", title: "Goals", type: "Landing", updated: "3 days ago", status: "published", views30d: 18420 },
  { slug: "/nutrients", title: "Nutrient Library", type: "Editorial", updated: "1 week ago", status: "published", views30d: 14210 },
  { slug: "/science", title: "Science", type: "Editorial", updated: "2 weeks ago", status: "published", views30d: 9820 },
  { slug: "/lab-reports", title: "Lab Reports", type: "Editorial", updated: "1 month ago", status: "published", views30d: 6410 },
  { slug: "/offers", title: "Offers", type: "Landing", updated: "Yesterday", status: "published", views30d: 12840 },
  { slug: "/stack-finder", title: "Stack Finder", type: "Landing", updated: "5 days ago", status: "draft", views30d: 0 },
];

export const promos: AdminPromo[] = [
  { id: "PR-01", code: "WELCOME10", description: "10% off first order", discount: "10%", used: 1284, cap: 5000, expires: "2025-12-31", active: true },
  { id: "PR-02", code: "FOUNDATION20", description: "20% off Daily Foundation", discount: "20%", used: 412, cap: 1000, expires: "2025-08-31", active: true },
  { id: "PR-03", code: "FREESHIP", description: "Free shipping above ₹999", discount: "Free shipping", used: 3210, cap: 99999, expires: "2026-01-31", active: true },
  { id: "PR-04", code: "MONSOON15", description: "Monsoon sale 15% off", discount: "15%", used: 982, cap: 1500, expires: "2025-07-15", active: false },
];

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
