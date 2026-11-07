/** Availability shown to visitors; exact stock counts stay private. */
export type Availability = "in" | "low" | "last";
/** Public product shape sent to visitors. Prices and stock are never included. */
export type Product = { id: string; n: string; b: string; c: string; m: string; d: string; img: string | null; f: boolean; a: Availability };
export type Category = { key: string; label: string };

export const ALL_CATEGORY: Category = { key: "all", label: "كل المنتجات" };
export const AVAILABILITY_LABELS: Record<Availability, string> = { in: "متوفر", low: "كمية محدودة", last: "آخر قطعة" };
export function availability(stock: number): Availability {
  return stock <= 1 ? "last" : stock <= 3 ? "low" : "in";
}
export const CONTACT = { email: "infolcrhouse@gmail.com", phone: "01006848573", wa: "201006848573" };
export const nf = (n: number) => Number(n).toLocaleString("ar-EG");
export const CUR = "ج.م";
