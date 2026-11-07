import { z } from "zod";
import { CONTACT } from "./brand";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم العميل (حرفين على الأقل)").max(100, "الاسم طويل جدًا"),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/, "اكتب رقم هاتف صحيح من ١٠ إلى ١٥ رقمًا"),
  email: z.union([z.literal(""), z.string().trim().email("اكتب بريدًا إلكترونيًا صحيحًا").max(255)]),
  company: z.string().trim().max(150),
  address: z.string().trim().max(300),
  notes: z.string().trim().max(1000),
});
export const quoteSchema = z.object({
  requestKey: z.string().uuid(),
  customer: customerSchema,
  items: z.array(z.object({ id: z.string().regex(/^\d{5}$/), quantity: z.number().int().min(1).max(999) }).strict()).min(1, "أضف منتجًا أولًا").max(100),
}).strict();
export type Customer = z.infer<typeof customerSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
/** Server-side catalogue row used to price a quote (never sent to visitors). */
export type PricedProduct = { id: string; name: string; model: string; price: number };

export function quoteLines(items: QuoteInput["items"], products: PricedProduct[]) {
  const seen = new Set<string>();
  return items.map(({ id, quantity }) => {
    const p = products.find((product) => product.id === id);
    if (!p || seen.has(id)) throw new Error("منتج غير صالح أو مكرر");
    seen.add(id);
    const price = Number(p.price);
    return { id, name: p.name, model: p.model, quantity, price, subtotal: Math.round(price * quantity * 100) / 100 };
  });
}
export function cleanCart(value: unknown, validIds: Set<string>): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, q]) => validIds.has(id) && typeof q === "number" && Number.isInteger(q) && q >= 1 && q <= 999).slice(0, 100));
}
export function quoteWhatsAppUrl(input: QuoteInput, reference: string, products: { id: string; n: string }[]) {
  const { customer, items } = quoteSchema.parse(input);
  const names = new Map(products.map((p) => [p.id, p.n]));
  const message = ["طلب عرض سعر - لايت كرنت هاوس", `رقم الطلب: ${reference}`, `العميل: ${customer.name}`, `الهاتف: ${customer.phone}`,
    customer.email && `البريد: ${customer.email}`, customer.company && `الشركة: ${customer.company}`, customer.address && `العنوان: ${customer.address}`,
    ...items.map((l) => `• ${names.get(l.id) ?? l.id} × ${l.quantity}`),
    customer.notes && `ملاحظات: ${customer.notes}`, "برجاء إرسال عرض السعر النهائي بالأسعار والتوافر بناءً على هذه المنتجات."].filter(Boolean).join("\n");
  return `https://wa.me/${CONTACT.wa}?text=${encodeURIComponent(message)}`;
}
