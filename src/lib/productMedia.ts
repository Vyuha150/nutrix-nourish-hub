import prodPowder from "@/assets/prod-powder.jpg";
import prodTablet from "@/assets/prod-tablet.jpg";
import prodSoftgel from "@/assets/prod-softgel.jpg";
import prodJar from "@/assets/prod-jar.jpg";
import prodBar from "@/assets/prod-bar.jpg";
import prodButter from "@/assets/prod-butter.jpg";
import type { ProductRecord } from "./types";

const images = {
  powder: prodPowder,
  tablet: prodTablet,
  softgel: prodSoftgel,
  jar: prodJar,
  bar: prodBar,
  butter: prodButter,
} as const;

const categoryFallbacks: Array<{ match: RegExp; image: string }> = [
  { match: /tablet|capsule/i, image: prodTablet },
  { match: /softgel/i, image: prodSoftgel },
  { match: /snack|bar/i, image: prodBar },
  { match: /topping|butter/i, image: prodButter },
  { match: /jar|premix/i, image: prodJar },
  { match: /beverage|greens|powder|shake/i, image: prodPowder },
];

export const resolveProductImage = (product: Pick<ProductRecord, "imageKey" | "category" | "name">) => {
  const direct = product.imageKey as keyof typeof images | undefined;
  if (direct && images[direct]) {
    return images[direct];
  }

  const categoryMatch = categoryFallbacks.find((entry) => entry.match.test(`${product.category} ${product.name}`));
  return categoryMatch?.image ?? prodPowder;
};