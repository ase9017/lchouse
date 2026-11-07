import { createServerFn } from "@tanstack/react-start";
import { quoteSchema, quoteLines } from "./quote";

// Intentional public write-only intake. No customer records are exposed to visitors.
export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => quoteSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const catalog = await supabaseAdmin.from("products").select("id, name, model, price").eq("active", true).in("id", data.items.map((i) => i.id));
    if (catalog.error) throw new Error("تعذر تحميل المنتجات؛ حاول مرة أخرى");
    const items = quoteLines(data.items, catalog.data);
    const total = Math.round(items.reduce((sum, line) => sum + line.subtotal, 0) * 100) / 100;
    const { data: row, error } = await supabaseAdmin.from("quote_requests").insert({
      request_key: data.requestKey,
      customer_name: data.customer.name,
      phone: data.customer.phone,
      email: data.customer.email,
      company: data.customer.company,
      address: data.customer.address,
      notes: data.customer.notes,
      items,
      estimated_total: total,
    }).select("id").single();
    if (error?.code === "23505") {
      const existing = await supabaseAdmin.from("quote_requests").select("id").eq("request_key", data.requestKey).single();
      if (existing.error || !existing.data) throw new Error("تعذر تأكيد الطلب؛ حاول مرة أخرى");
      return { id: existing.data.id };
    }
    if (error || !row) throw new Error("تعذر حفظ طلب عرض السعر؛ حاول مرة أخرى");
    return { id: row.id };
  });
