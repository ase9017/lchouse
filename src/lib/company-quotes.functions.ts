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