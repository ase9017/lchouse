import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listCompanyQuotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ page: z.number().int().min(0).max(10000) }).parse(v))
  .handler(async ({ context, data }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || role.data !== true) return { allowed: false, rows: [], count: 0 };
    const result = await context.supabase.from("quote_requests").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(data.page * 25, data.page * 25 + 24);
    if (result.error) throw new Error("تعذر تحميل طلبات عروض السعر");
    return { allowed: true, rows: result.data ?? [], count: result.count ?? 0 };
  });
export const updateQuotePrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid(), prices: z.record(z.string().regex(/^\d{5}$/), z.number().min(0).max(100000000)) }).parse(v))
  .handler(async ({ context, data }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || role.data !== true) throw new Error("غير مسموح");
    const row = await context.supabase.from("quote_requests").select("items").eq("id", data.id).single();
    if (row.error || !Array.isArray(row.data?.items)) throw new Error("تعذر تحميل الطلب");
    const items = (row.data.items as { id: string; quantity: number; price: number }[]).map((l) => {
      const price = data.prices[l.id] ?? l.price;
      return { ...l, price, subtotal: Math.round(price * l.quantity * 100) / 100 };
    });
    const total = Math.round(items.reduce((s, l) => s + l.subtotal, 0) * 100) / 100;
    const result = await context.supabase.from("quote_requests").update({ items, estimated_total: total }).eq("id", data.id).select("id").single();
    if (result.error || !result.data) throw new Error("تعذر حفظ الأسعار");
    return { success: true, total };
  });
export const updateQuoteStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["pending", "quoted", "closed"]) }).parse(v))
  .handler(async ({ context, data }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || role.data !== true) throw new Error("غير مسموح");
    const result = await context.supabase.from("quote_requests").update({ status: data.status }).eq("id", data.id).select("id").single();
    if (result.error || !result.data) throw new Error("تعذر تحديث الطلب");
    return { success: true };
  });