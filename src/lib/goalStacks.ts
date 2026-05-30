import type { ProductRecord } from "@/lib/types";

const goalStackNames: Record<string, string[]> = {
  "All-day Energy": ["Complete Daily Foundation", "Vitamin D3 + K2 (MK-7)", "Omega-3 Algal Softgel", "Multivitamin (Adults)"],
  Immunity: ["Vitamin D3 + K2 (MK-7)", "Omega-3 Algal Softgel", "Multivitamin (Adults)", "Complete Daily Foundation"],
  "Focus & Memory": ["Omega-3 Algal Softgel", "Multivitamin (Adults)", "Complete Daily Foundation"],
  "Sleep & Recovery": ["Complete Daily Foundation", "Vitamin D3 + K2 (MK-7)", "Omega-3 Algal Softgel"],
  "Strength & Performance": ["Complete Daily Foundation", "Omega-3 Algal Softgel", "Multivitamin (Adults)", "Vitamin D3 + K2 (MK-7)"],
  "Heart Health": ["Omega-3 Algal Softgel", "Vitamin D3 + K2 (MK-7)", "Multivitamin (Adults)"],
  "Skin, Hair & Nails": ["Complete Daily Foundation", "Vitamin D3 + K2 (MK-7)", "Omega-3 Algal Softgel", "Multivitamin (Adults)"],
  "Gut & Digestion": ["Complete Daily Foundation", "Multivitamin (Adults)", "Omega-3 Algal Softgel"],
};

const normalize = (value: string) => value.trim().toLowerCase();

const uniqueProducts = (products: ProductRecord[]) => {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
};

export const resolveGoalStackProducts = (goal: string, products: ProductRecord[], fallbackNames: string[] = []) => {
  const candidateNames = goalStackNames[goal] ?? fallbackNames;
  const resolved = candidateNames
    .map((name) => products.find((product) => normalize(product.name) === normalize(name) || normalize(product.name).includes(normalize(name)) || normalize(name).includes(normalize(product.name))))
    .filter((product): product is ProductRecord => Boolean(product));

  if (resolved.length) {
    return uniqueProducts(resolved);
  }

  const fallbackResolved = fallbackNames
    .map((name) => products.find((product) => normalize(product.name) === normalize(name) || normalize(product.name).includes(normalize(name)) || normalize(name).includes(normalize(product.name))))
    .filter((product): product is ProductRecord => Boolean(product));

  return uniqueProducts(fallbackResolved.length ? fallbackResolved : products.slice(0, 3));
};