import { getAdminAnalytics } from "@/lib/api";
import type { AnalyticsPayload } from "@/lib/types";
import { toast } from "sonner";

const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatCsvRow = (cells: unknown[]): string => {
  return cells.map(escapeCsvCell).join(",");
};

export const exportAnalyticsToCsv = async (providedData?: AnalyticsPayload): Promise<boolean> => {
  try {
    const data: AnalyticsPayload = providedData || (await getAdminAnalytics());

    const kpis = data.kpis || {
      revenue: { value: 0, delta: 0 },
      orders: { value: 0, delta: 0 },
      customers: { value: 0, delta: 0 },
      aov: { value: 0, delta: 0 },
      conversion: { value: 0, delta: 0 },
      refundRate: { value: 0, delta: 0 },
    };

    const paymentSummary = data.paymentStatusSummary || {
      paid: { count: 0, total: 0 },
      pending: { count: 0, total: 0 },
      failed: { count: 0, total: 0 },
      refunded: { count: 0, total: 0 },
    };

    const orderSummary = data.orderStatusSummary || {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    const products = data.products || [];
    const customers = data.customers || [];

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const reportDateStr = `${year}-${month}-${day}`;
    const generatedTimestamp = data.generatedAt || now.toISOString();
    const reportingPeriod = data.reportingPeriod || "Last 30 days";

    const rows: string[] = [];

    // 1. Report Metadata
    rows.push(formatCsvRow(["REPORT TITLE", "The Nature's Way - Analytics Export"]));
    rows.push(formatCsvRow(["GENERATION DATE", generatedTimestamp]));
    rows.push(formatCsvRow(["REPORTING PERIOD", reportingPeriod]));
    rows.push("");

    // 2. Key Performance Indicators
    rows.push(formatCsvRow(["KEY PERFORMANCE INDICATORS"]));
    rows.push(formatCsvRow(["Metric", "Value", "Notes"]));
    rows.push(formatCsvRow(["Total Collected Revenue (Paid Only)", kpis.revenue?.value ?? 0, "INR - Verified Paid orders only (pending and failed excluded)"]));
    rows.push(formatCsvRow(["Total Orders", kpis.orders?.value ?? 0, "All placed orders"]));
    rows.push(formatCsvRow(["Paid Orders", paymentSummary.paid?.count ?? 0, "Orders with confirmed offline payment"]));
    rows.push(formatCsvRow(["Pending Orders", paymentSummary.pending?.count ?? 0, "Awaiting offline payment confirmation"]));
    rows.push(formatCsvRow(["Failed Orders", paymentSummary.failed?.count ?? 0, "Failed / rejected payment verification"]));
    rows.push(formatCsvRow(["Refunded Orders", paymentSummary.refunded?.count ?? 0, "Refunded orders"]));
    rows.push(formatCsvRow(["Total Customers", kpis.customers?.value ?? 0, "Registered & store customers"]));
    rows.push(formatCsvRow(["Average Order Value (AOV)", kpis.aov?.value ?? 0, "INR - Calculated on paid orders only"]));
    rows.push(formatCsvRow(["Conversion Rate", `${kpis.conversion?.value ?? 0}%`, "Store conversion rate"]));
    rows.push(formatCsvRow(["Refund Rate", `${kpis.refundRate?.value ?? 0}%`, "Percentage of refunded orders"]));
    rows.push("");

    // 3. Payment Status Breakdown
    rows.push(formatCsvRow(["PAYMENT STATUS BREAKDOWN"]));
    rows.push(formatCsvRow(["Payment Status", "Order Count", "Total Amount (INR)", "Revenue Status"]));
    rows.push(formatCsvRow(["Paid", paymentSummary.paid?.count ?? 0, paymentSummary.paid?.total ?? 0, "Collected (Included in Revenue)"]));
    rows.push(formatCsvRow(["Pending", paymentSummary.pending?.count ?? 0, paymentSummary.pending?.total ?? 0, "Awaiting Verification (Excluded from Revenue)"]));
    rows.push(formatCsvRow(["Failed", paymentSummary.failed?.count ?? 0, paymentSummary.failed?.total ?? 0, "Rejected / Cancelled (Excluded from Revenue)"]));
    rows.push(formatCsvRow(["Refunded", paymentSummary.refunded?.count ?? 0, paymentSummary.refunded?.total ?? 0, "Refunded"]));
    rows.push("");

    // 4. Order Fulfillment Status Breakdown
    rows.push(formatCsvRow(["ORDER FULFILLMENT STATUS BREAKDOWN"]));
    rows.push(formatCsvRow(["Fulfillment Status", "Order Count"]));
    rows.push(formatCsvRow(["Pending", orderSummary.pending ?? 0]));
    rows.push(formatCsvRow(["Confirmed", orderSummary.confirmed ?? 0]));
    rows.push(formatCsvRow(["Processing", orderSummary.processing ?? 0]));
    rows.push(formatCsvRow(["Shipped", orderSummary.shipped ?? 0]));
    rows.push(formatCsvRow(["Delivered", orderSummary.delivered ?? 0]));
    rows.push(formatCsvRow(["Cancelled", orderSummary.cancelled ?? 0]));
    rows.push(formatCsvRow(["Refunded", orderSummary.refunded ?? 0]));
    rows.push("");

    // 5. Product Performance
    rows.push(formatCsvRow(["PRODUCT PERFORMANCE"]));
    rows.push(formatCsvRow([
      "Product SKU / ID",
      "Product Name",
      "Category",
      "Form",
      "Unit Price (INR)",
      "MRP (INR)",
      "Current Stock",
      "Units Sold (Last 30 Days)",
      "Revenue from Paid Orders (INR)",
      "Status",
    ]));

    if (products.length === 0) {
      rows.push(formatCsvRow(["No products available", 0, "", "", 0, 0, 0, 0, 0, ""]));
    } else {
      for (const p of products) {
        const sold = p.sold30d ?? 0;
        const rev = sold * (p.price ?? 0);
        rows.push(formatCsvRow([
          p.id,
          p.name,
          p.category,
          p.form,
          p.price,
          p.mrp,
          p.stock,
          sold,
          rev,
          p.status,
        ]));
      }
    }
    rows.push("");

    // 6. Customer Overview
    rows.push(formatCsvRow(["CUSTOMER OVERVIEW"]));
    rows.push(formatCsvRow([
      "Customer ID",
      "Customer Name",
      "Email Address",
      "Joined Date",
      "Segment",
      "Total Orders",
      "Lifetime Value (INR - Paid Only)",
      "Last Order Date",
      "Registered Account",
    ]));

    if (customers.length === 0) {
      rows.push(formatCsvRow(["No customer records found", "", "", "", "", 0, 0, "—", "No"]));
    } else {
      for (const c of customers) {
        rows.push(formatCsvRow([
          c.id,
          c.name,
          c.email,
          c.joined,
          c.segment,
          c.orders ?? 0,
          c.ltv ?? 0,
          c.lastOrder || "—",
          c.isRegistered ? "Yes" : "No",
        ]));
      }
    }

    const csvContent = rows.join("\r\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

    const filename = `the-natures-way-analytics-${reportDateStr}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Analytics CSV exported successfully");
    return true;
  } catch (err: any) {
    console.error("Failed to export analytics CSV:", err);
    toast.error(err?.message || "Failed to export analytics CSV");
    return false;
  }
};
