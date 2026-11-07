import { describe, expect, it } from "vitest";
import { customerSchema, quoteSchema, quoteLines, cleanCart, quoteWhatsAppUrl, type PricedProduct } from "@/lib/quote";
import { CONTACT, availability } from "@/lib/brand";

const catalog: PricedProduct[] = [
  { id: "00001", name: "camera dahua 2 mp", model: "DH-HAC-HDW1209TLQP", price: 1080 },
  { id: "00002", name: "جهاز تسجيل 4 مخرج", model: "HGHI-M1", price: 1920 },
];
const publicCatalog = catalog.map((p) => ({ id: p.id, n: p.name }));
const customer = { name: "عميل اختبار", phone: "01012345678", email: "", company: "", address: "", notes: "" };
const request = { requestKey: "12345678-1234-4234-8234-123456789012", customer, items: [{ id: "00001", quantity: 2 }] };
describe("Quotation requests", () => {
  it("requires customer name before accepting a quote request", () => {
    expect(customerSchema.safeParse({ ...customer, name: "" }).success).toBe(false);
  });
  it("requires a valid customer phone", () => {
    expect(customerSchema.safeParse({ ...customer, phone: "" }).success).toBe(false);
    expect(customerSchema.safeParse(customer).success).toBe(true);
  });
  it("keeps requested products and quantities in the quotation", () => {
    const lines = quoteLines(quoteSchema.parse(request).items, catalog);
    expect(lines[0]).toMatchObject({ id: "00001", quantity: 2, price: 1080, subtotal: 2160 });
  });
  it("rejects zero quantities and empty carts", () => {
    expect(quoteSchema.safeParse({ ...request, items: [] }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...request, items: [{ id: "00001", quantity: 0 }] }).success).toBe(false);
  });
  it("rejects unknown and repeated products", () => {
    expect(() => quoteLines([{ id: "99999", quantity: 1 }], catalog)).toThrow();
    expect(() => quoteLines([...request.items, ...request.items], catalog)).toThrow();
  });
  it("uses catalogue prices, not submitted prices", () => {
    expect(quoteLines(request.items, catalog)[0]?.price).toBe(1080);
    expect(quoteSchema.safeParse({ ...request, items: [{ id: "00001", quantity: 2, price: 1 }] }).success).toBe(false);
  });
  it("accepts numeric prices returned as strings by the database", () => {
    expect(quoteLines(request.items, [{ ...catalog[0]!, price: "1080.50" as unknown as number }])[0]).toMatchObject({ price: 1080.5, subtotal: 2161 });
  });
  it("encodes customer details in the business WhatsApp handoff", () => {
    const url = new URL(quoteWhatsAppUrl({ ...request, customer: { ...customer, notes: "A&B #1" } }, "reference", publicCatalog));
    expect(url.pathname).toBe(`/${CONTACT.wa}`);
    expect(url.searchParams.get("text")).toContain("A&B #1");
    expect(url.searchParams.get("text")).toContain(customer.phone);
  });
  it("keeps prices out of the customer-facing quotation handoff", () => {
    const text = new URL(quoteWhatsAppUrl(request, "reference", publicCatalog)).searchParams.get("text") ?? "";
    expect(text).not.toContain("ج.م");
    expect(text).not.toContain("الإجمالي");
    expect(text).not.toContain("1080");
  });
  it("discards corrupt persisted cart entries", () => {
    expect(cleanCart({ "00001": 2, "00002": -2, "00003": "3", "99999": 1 }, new Set(["00001", "00002", "00003"]))).toEqual({ "00001": 2 });
  });
  it("shows availability bands instead of exact stock", () => {
    expect([availability(1), availability(3), availability(20)]).toEqual(["last", "low", "in"]);
  });
});
