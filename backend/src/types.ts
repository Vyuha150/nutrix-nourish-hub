export type ProductStatus = "active" | "draft" | "archived";
export type ProductShowcaseGroup = "best" | "new" | "catalog";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "paid" | "pending" | "refunded";
export type PageType = "Landing" | "Product" | "Editorial" | "System";
export type PageStatus = "published" | "draft";
export type CustomerSegment = "VIP" | "Regular" | "New" | "At-risk";

export interface OfferRecord {
  id: string;
  productId: string;
  title: string;
  description: string;
  badge: string;
  wasPrice: number;
  nowPrice: number;
  discountPercent: number;
  active: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LabReportRecord {
  id: string;
  productId: string;
  productName: string;
  lotNumber: string;
  testedOn: string;
  labName: string;
  potency: string;
  metals: string;
  micro: string;
  reportUrl?: string;
  reportFileName?: string;
  reportFileType?: string;
  reportFileData?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCartItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  imageKey?: string;
}

export interface UserStateRecord {
  userId: string;
  email: string;
  name: string;
  cart: UserCartItem[];
  wishlist: string[];
  updatedAt?: Date;
  createdAt?: Date;
}

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  form: string;
  price: number;
  mrp: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  reviews: number;
  sold30d: number;
  imageKey: string;
  showcaseGroup: ProductShowcaseGroup;
  bestTime: string;
  featured: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  joined: string;
  segment: CustomerSegment;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderLineItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  imageKey?: string;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
  payment: PaymentStatus;
  lineItems: OrderLineItem[];
  couponCode?: string;
  paymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PageRecord {
  slug: string;
  title: string;
  type: PageType;
  updated: string;
  status: PageStatus;
  views30d: number;
  seoDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromoRecord {
  id: string;
  code: string;
  description: string;
  discount: string;
  used: number;
  cap: number;
  expires: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SiteConfigRecord {
  _id: "siteConfig";
  promoBar: string;
  heroHeadline: string;
  heroSubheadline: string;
  promoMessages: string[];
  updatedAt?: Date;
}

export interface CheckoutCouponRecord {
  code: string;
  description: string;
  discount: string;
  active: boolean;
  expires: string;
}

export interface RevenuePoint {
  d: string;
  revenue: number;
  orders: number;
}

export interface TrafficPoint {
  page: string;
  views: number;
  conv: number;
}

export interface ChannelShare {
  name: string;
  value: number;
}

export interface KpiPoint {
  value: number;
  delta: number;
}

export interface AdminKpis {
  revenue: KpiPoint;
  orders: KpiPoint;
  customers: KpiPoint;
  aov: KpiPoint;
  conversion: KpiPoint;
  refundRate: KpiPoint;
}

export type OrderListItem = {
  id: string;
  customerId: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
  payment: PaymentStatus;
  lineItems: OrderLineItem[];
};

export type CustomerStats = CustomerRecord & {
  orders: number;
  ltv: number;
  lastOrder: string;
};

export interface AdminSummaryPayload {
  kpis: AdminKpis;
  revenueSeries: RevenuePoint[];
  channelMix: ChannelShare[];
  recentOrders: OrderListItem[];
  topProducts: ProductRecord[];
}

export interface AnalyticsPayload {
  kpis: AdminKpis;
  revenueSeries: RevenuePoint[];
  trafficByPage: TrafficPoint[];
  products: ProductRecord[];
  customers: CustomerStats[];
}

export interface UserStatePayload {
  userId: string;
  email: string;
  name: string;
  cart: UserCartItem[];
  wishlist: string[];
}