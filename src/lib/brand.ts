import raw from "./products.json";

export type Product = { id: string; n: string; b: string; c: string; m: string; d: string; p: number; s: number };
export const PRODUCTS = raw as Product[];
export const FEATURED = ["00035", "00022", "00034", "00030", "00068", "00075"];
export const CATS: [string, string][] = [
  ["all", "كل المنتجات"],
  ["cam", "كاميرات المراقبة"],
  ["rec", "مسجلات DVR / NVR"],
  ["net", "الشبكات و PoE"],
  ["acc", "الكابلات والملحقات"],
  ["misc", "أجهزة متنوعة"],
];
export const CONTACT = { email: "infolcrhouse@gmail.com", phone: "01006848573", wa: "201006848573" };
export const nf = (n: number) => Number(n).toLocaleString("ar-EG");
export const CUR = "ج.م";
