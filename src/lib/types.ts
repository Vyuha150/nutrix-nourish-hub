export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
export type ProductStatus = "active" | "draft" | "archived";
export type ProductShowcaseGroup = "best" | "new" | "catalog";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";
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
  reportDownloadUrl?: string;
  active: boolean;
}

export interface UserCartItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  imageKey?: string;
}

export interface UserStatePayload {
  userId: string;
  email: string;
  name: string;
  cart: UserCartItem[];
  wishlist: string[];
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
  imageUrl?: string;
  showcaseGroup: ProductShowcaseGroup;
  bestTime: string;
  featured: boolean;
  description?: string;
}

export interface CustomerRecord {
  id: string;
  userId?: string;
  name: string;
  email: string;
  joined: string;
  segment: CustomerSegment;
}

export interface CustomerStats extends CustomerRecord {
  orders: number;
  ltv: number;
  lastOrder: string;
  isRegistered?: boolean;
}

export interface OrderLineItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  imageKey?: string;
}

export type ShipmentStatus =
  | "Order Placed"
  | "Order Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Reached Nearest Hub"
  | "Out for Delivery"
  | "Delivered"
  | "Delivery Attempt Failed"
  | "Returned";

export interface ShipmentEvent {
  id: string;
  status: ShipmentStatus;
  location?: string;
  district?: string;
  nearestHub?: string;
  timestamp: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  updatedBy?: string;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  building?: string;
  street?: string;
  town?: string;
  mandal?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  address?: string;
  city?: string;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  customer: string;
  email: string;
  phone?: string;
  shippingAddress?: ShippingAddress;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
  payment: PaymentStatus;
  lineItems: OrderLineItem[];
  couponCode?: string;
  paymentId?: string;
  paymentReference?: string;
  paymentConfirmedBy?: string;
  paymentConfirmedAt?: Date | string;
  paymentFailedBy?: string;
  paymentFailedAt?: Date | string;
  paymentNote?: string;
  shipmentStatus?: ShipmentStatus;
  shipmentLocation?: string;
  shipmentDistrict?: string;
  shipmentNearestHub?: string;
  shipmentCarrier?: string;
  shipmentTrackingNumber?: string;
  estimatedDeliveryDate?: string;
  shipmentUpdatedAt?: Date | string;
  shipmentHistory?: ShipmentEvent[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PageRecord {
  slug: string;
  title: string;
  type: PageType;
  updated: string;
  status: PageStatus;
  views30d: number;
  seoDescription?: string;
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
}

export interface SiteConfigRecord {
  _id?: "siteConfig";
  promoBar: string;
  heroHeadline: string;
  heroSubheadline: string;
  promoMessages: string[];
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

export interface AdminSummaryPayload {
  kpis: AdminKpis;
  revenueSeries: RevenuePoint[];
  channelMix: ChannelShare[];
  recentOrders: OrderRecord[];
  topProducts: ProductRecord[];
}

export interface AnalyticsPayload {
  kpis: AdminKpis;
  revenueSeries: RevenuePoint[];
  trafficByPage: TrafficPoint[];
  products: ProductRecord[];
  customers: CustomerStats[];
  orderStatusSummary?: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
  };
  paymentStatusSummary?: {
    paid: { count: number; total: number };
    pending: { count: number; total: number };
    failed: { count: number; total: number };
    refunded: { count: number; total: number };
  };
  reportingPeriod?: string;
  generatedAt?: string;
}

export interface ApiErrorPayload {
  error: string;
}