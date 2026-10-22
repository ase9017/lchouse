import { describe, expect, it } from "vitest";
import { customerSchema, quoteSchema, quoteLines, cleanCart, quoteWhatsAppUrl } from "@/lib/quote";
import { PRODUCTS, CONTACT } from "@/lib/brand";

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
    const lines = quoteLines(quoteSchema.parse(request).items);
    expect(lines[0]).toMatchObject({ id: "00001", quantity: 2, price: 1080, subtotal: 2160 });
  });
  it("rejects zero quantities and empty carts", () => {
    expect(quoteSchema.safeParse({ ...request, items: [] }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...request, items: [{ id: "00001", quantity: 0 }] }).success).toBe(false);
  });
  it("rejects unknown and repeated products", () => {
    expect(() => quoteLines([{ id: "99999", quantity: 1 }])).toThrow();
    expect(() => quoteLines([...request.items, ...request.items])).toThrow();
  });
  it("uses catalogue prices, not submitted prices", () => {
    expect(quoteLines(request.items)[0]?.price).toBe(PRODUCTS.find((p) => p.id === "00001")?.p);
    expect(quoteSchema.safeParse({ ...request, items: [{ id: "00001", quantity: 2, price: 1 }] }).success).toBe(false);
  });
  it("encodes customer details in the business WhatsApp handoff", () => {
    const url = new URL(quoteWhatsAppUrl({ ...request, customer: { ...customer, notes: "A&B #1" } }, "reference"));
    expect(url.pathname).toBe(`/${CONTACT.wa}`);
    expect(url.searchParams.get("text")).toContain("A&B #1");
    expect(url.searchParams.get("text")).toContain(customer.phone);
  });
  it("discards corrupt persisted cart entries", () => {
    expect(cleanCart({ "00001": 2, "00002": -2, "00003": "3", "99999": 1 })).toEqual({ "00001": 2 });
  });
});