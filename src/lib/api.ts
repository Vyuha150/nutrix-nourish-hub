import type {
  AnalyticsPayload,
  AdminSummaryPayload,
  ApiErrorPayload,
  AuthResponse,
  AuthUser,
  CustomerRecord,
  CustomerStats,
  LabReportRecord,
  OrderRecord,
  PageRecord,
  ProductRecord,
  OfferRecord,
  PromoRecord,
  ShipmentStatus,
  SiteConfigRecord,
  UserRole,
  UserStatePayload,
} from "./types";
import type { AddressValidationResult } from "./pincodeValidator";

export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api").replace(/\/$/, "");

export const buildApiUrl = (path: string) => `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

const TOKEN_KEY = "nutrix_auth_token";

let currentToken: string | null = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
let unauthorizedHandler: (() => void) | null = null;

export const getAuthToken = () => currentToken;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
};

export const onUnauthorized = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (currentToken && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 401) {
    // If request failed with 401 and was an authenticated request, notify auth listener
    if (unauthorizedHandler) {
      unauthorizedHandler();
    }
  }

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = payload.error || message;
    } catch {
      // ignore parse errors and fall back to HTTP status text
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", jsonInit("POST", payload)),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", jsonInit("POST", payload)),
  me: () => request<{ user: AuthUser }>("/auth/me"),
};

export const publicApi = {
  getSiteConfig: () => request<SiteConfigRecord>("/public/site-config"),
  getPromos: () => request<PromoRecord[]>("/public/promos"),
  getOffers: () => request<OfferRecord[]>("/public/offers"),
  getLabReports: () => request<LabReportRecord[]>("/public/lab-reports"),
  getProducts: (params?: { status?: string; category?: string; showcaseGroup?: string; q?: string }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    const query = searchParams.toString();
    return request<ProductRecord[]>(`/public/products${query ? `?${query}` : ""}`);
  },
  getPages: () => request<PageRecord[]>("/public/pages"),
  getUserState: (userId: string) => request<UserStatePayload>(`/public/users/${encodeURIComponent(userId)}`),
  saveUserState: (userId: string, payload: Partial<UserStatePayload>) => request<UserStatePayload>(`/public/users/${encodeURIComponent(userId)}`, jsonInit("PUT", payload)),
  getOrders: () => request<OrderRecord[]>("/public/orders"),
  createOrder: (payload: Partial<OrderRecord>) => request<OrderRecord>("/public/orders", jsonInit("POST", payload)),
  validatePincode: (payload: { pincode: string; state?: string; district?: string; locality?: string }) =>
    request<AddressValidationResult>("/public/validate-pincode", jsonInit("POST", payload)),
  getSearchSuggestions: (q: string) =>
    request<{ query: string; products: ProductRecord[] }>(`/public/search-suggestions?q=${encodeURIComponent(q)}`),
};

export const adminApi = {
  getSummary: () => request<AdminSummaryPayload>("/admin/summary"),
  getAnalytics: () => request<AnalyticsPayload>("/admin/analytics"),
  getSearchSuggestions: (q: string) =>
    request<{ query: string; products: ProductRecord[]; orders: OrderRecord[]; customers: CustomerStats[] }>(
      `/admin/search-suggestions?q=${encodeURIComponent(q)}`
    ),

  listProducts: () => request<ProductRecord[]>("/admin/products"),
  createProduct: (payload: Partial<ProductRecord>) => request<ProductRecord>("/admin/products", jsonInit("POST", payload)),
  updateProduct: (id: string, payload: Partial<ProductRecord>) => request<ProductRecord>(`/admin/products/${id}`, jsonInit("PUT", payload)),
  deleteProduct: (id: string) => request<void>(`/admin/products/${id}`, jsonInit("DELETE")),

  listOrders: () => request<OrderRecord[]>("/admin/orders"),
  createOrder: (payload: Partial<OrderRecord>) => request<OrderRecord>("/admin/orders", jsonInit("POST", payload)),
  updateOrder: (id: string, payload: Partial<OrderRecord>) => request<OrderRecord>(`/admin/orders/${encodeURIComponent(id)}`, jsonInit("PUT", payload)),
  confirmOrderPayment: (id: string, payload: { action: "mark_paid" | "mark_failed"; paymentReference?: string; confirmed?: boolean; note?: string; }) =>
    request<OrderRecord>(`/admin/orders/${encodeURIComponent(id)}/payment`, jsonInit("PUT", payload)),
  updateOrderShipment: (
    id: string,
    payload: {
      status: ShipmentStatus;
      location?: string;
      district?: string;
      nearestHub?: string;
      carrier?: string;
      trackingNumber?: string;
      estimatedDeliveryDate?: string;
      notes?: string;
    }
  ) => request<OrderRecord>(`/admin/orders/${encodeURIComponent(id)}/shipment`, jsonInit("PUT", payload)),

  listCustomers: () => request<CustomerStats[]>("/admin/customers"),
  createCustomer: (payload: Partial<CustomerRecord>) => request<CustomerRecord>("/admin/customers", jsonInit("POST", payload)),
  updateCustomer: (id: string, payload: Partial<CustomerRecord>) => request<CustomerRecord>(`/admin/customers/${id}`, jsonInit("PUT", payload)),

  listPages: () => request<PageRecord[]>("/admin/pages"),
  createPage: (payload: Partial<PageRecord>) => request<PageRecord>("/admin/pages", jsonInit("POST", payload)),
  updatePage: (slug: string, payload: Partial<PageRecord>) => request<PageRecord>(`/admin/pages/${encodeURIComponent(slug)}`, jsonInit("PUT", payload)),
  deletePage: (slug: string) => request<void>(`/admin/pages/${encodeURIComponent(slug)}`, jsonInit("DELETE")),

  listPromos: () => request<PromoRecord[]>("/admin/promos"),
  createPromo: (payload: Partial<PromoRecord>) => request<PromoRecord>("/admin/promos", jsonInit("POST", payload)),
  updatePromo: (id: string, payload: Partial<PromoRecord>) => request<PromoRecord>(`/admin/promos/${id}`, jsonInit("PUT", payload)),
  deletePromo: (id: string) => request<void>(`/admin/promos/${id}`, jsonInit("DELETE")),

  listOffers: () => request<OfferRecord[]>("/admin/offers"),
  createOffer: (payload: Partial<OfferRecord>) => request<OfferRecord>("/admin/offers", jsonInit("POST", payload)),
  updateOffer: (id: string, payload: Partial<OfferRecord>) => request<OfferRecord>(`/admin/offers/${id}`, jsonInit("PUT", payload)),
  deleteOffer: (id: string) => request<void>(`/admin/offers/${id}`, jsonInit("DELETE")),

  listLabReports: () => request<LabReportRecord[]>("/admin/lab-reports"),
  createLabReport: (payload: Partial<LabReportRecord>) => request<LabReportRecord>("/admin/lab-reports", jsonInit("POST", payload)),
  updateLabReport: (id: string, payload: Partial<LabReportRecord>) => request<LabReportRecord>(`/admin/lab-reports/${id}`, jsonInit("PUT", payload)),
  deleteLabReport: (id: string) => request<void>(`/admin/lab-reports/${id}`, jsonInit("DELETE")),

  getSiteConfig: () => request<SiteConfigRecord>("/admin/site-config"),
  updateSiteConfig: (payload: Partial<SiteConfigRecord>) => request<SiteConfigRecord>("/admin/site-config", jsonInit("PUT", payload)),

  listUsers: () => request<AuthUser[]>("/admin/users"),
  updateUserRole: (id: string, role: UserRole) => request<AuthUser>(`/admin/users/${id}/role`, jsonInit("PATCH", { role })),
};

export const getAdminSummary = () => adminApi.getSummary();
export const getAdminAnalytics = () => adminApi.getAnalytics();

export const getProducts = (query = "") => request<ProductRecord[]>(`/admin/products${query ? `?${query}` : ""}`);
export const getProduct = (id: string) => request<ProductRecord>(`/admin/products/${id}`);
export const createProduct = (payload: Partial<ProductRecord>) => adminApi.createProduct(payload);
export const updateProduct = (id: string, payload: Partial<ProductRecord>) => adminApi.updateProduct(id, payload);
export const deleteProduct = (id: string) => adminApi.deleteProduct(id);

export const getOrders = (query = "") => request<OrderRecord[]>(`/admin/orders${query ? `?${query}` : ""}`);
export const getOrder = (id: string) => request<OrderRecord>(`/admin/orders/${encodeURIComponent(id)}`);
export const createOrder = (payload: Partial<OrderRecord>) => adminApi.createOrder(payload);
export const updateOrder = (id: string, payload: Partial<OrderRecord>) => adminApi.updateOrder(id, payload);
export const confirmOrderPayment = (id: string, payload: { action: "mark_paid" | "mark_failed"; paymentReference?: string; confirmed?: boolean; note?: string; }) =>
  adminApi.confirmOrderPayment(id, payload);
export const updateOrderShipment = (
  id: string,
  payload: {
    status: ShipmentStatus;
    location?: string;
    district?: string;
    nearestHub?: string;
    carrier?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    notes?: string;
  }
) => adminApi.updateOrderShipment(id, payload);

export const validatePincode = (payload: { pincode: string; state?: string; district?: string; locality?: string }) =>
  publicApi.validatePincode(payload);
export const getSearchSuggestions = (q: string) => publicApi.getSearchSuggestions(q);
export const getAdminSearchSuggestions = (q: string) => adminApi.getSearchSuggestions(q);

export const getMyOrders = () => publicApi.getOrders();

export const getCustomers = () => request<CustomerStats[]>("/admin/customers");
export const getCustomer = (id: string) => request<CustomerStats>(`/admin/customers/${id}`);

export const getUsers = () => adminApi.listUsers();
export const updateUserRole = (id: string, role: UserRole) => adminApi.updateUserRole(id, role);

export const getPages = () => request<PageRecord[]>("/admin/pages");
export const getPromos = () => request<PromoRecord[]>("/admin/promos");
export const getSiteConfig = () => request<SiteConfigRecord>("/admin/site-config");
export const updateSiteConfig = (payload: Partial<SiteConfigRecord>) => adminApi.updateSiteConfig(payload);
export const createPromo = (payload: Partial<PromoRecord>) => adminApi.createPromo(payload);
export const updatePromo = (id: string, payload: Partial<PromoRecord>) => adminApi.updatePromo(id, payload);
export const deletePromo = (id: string) => adminApi.deletePromo(id);

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
