import type { Product } from "./brand";

/** Folds Arabic spelling variants, diacritics, Arabic-Indic digits and punctuation so a search matches however it is typed. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export const searchText = (p: Pick<Product, "n" | "m" | "b" | "id" | "d">) => normalize(`${p.n} ${p.m} ${p.b} ${p.id} ${p.d}`);
export const queryWords = (query: string) => normalize(query).split(" ").filter(Boolean);

/** Every word must appear; model numbers also match when typed without their dashes or spaces. */
export function matchesWords(text: string, words: string[]): boolean {
  if (!words.length) return true;
  const tight = text.replaceAll(" ", "");
  return words.every((w) => text.includes(w) || tight.includes(w));
}
