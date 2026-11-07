import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Company product management. Every call re-checks the admin role, and RLS enforces it again in the database.
async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  return !role.error && role.data === true;
}

export const productInputSchema = z.object({
  id: z.string().regex(/^\d{5}$/).optional(),
  name: z.string().trim().min(2, "اكتب اسم المنتج (حرفين على الأقل)").max(200),
  brand: z.string().trim().max(60),
  category: z.string().regex(/^[a-z]{2,20}$/, "اختر التصنيف"),
  model: z.string().trim().max(100),
  description: z.string().trim().max(2000),
  price: z.number({ invalid_type_error: "اكتب سعرًا صحيحًا" }).min(0, "السعر لا يكون سالبًا").max(100000000),
  stock: z.number({ invalid_type_error: "اكتب كمية صحيحة" }).int("الكمية رقم صحيح").min(0, "الكمية لا تكون سالبة").max(1000000),
  image_url: z.string().url().max(500).nullable(),
  featured: z.boolean(),
  active: z.boolean(),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const listAdminProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await assertAdmin(context))) return { allowed: false as const, products: [], categories: [] };
    const [products, categories] = await Promise.all([
      context.supabase.from("products").select("*").order("id"),
      context.supabase.from("product_categories").select("key, label").order("sort_order"),
    ]);
    if (products.error || categories.error) throw new Error("تعذر تحميل المنتجات");
    return {
      allowed: true as const,
      products: products.data.map((p) => ({ ...p, price: Number(p.price) })),
      categories: categories.data,
    };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => productInputSchema.parse(v))
  .handler(async ({ context, data }) => {
    if (!(await assertAdmin(context))) throw new Error("غير مسموح");
    const { id, ...fields } = data;
    if (id) {
      const result = await context.supabase.from("products").update(fields).eq("id", id).select("id").single();
      if (result.error || !result.data) throw new Error("تعذر حفظ المنتج");
      return { id };
    }
    // New product: next five-digit code after the highest existing one. Retry if two admins save at once.
    for (let attempt = 0; attempt < 3; attempt++) {
      const last = await context.supabase.from("products").select("id").order("id", { ascending: false }).limit(1).maybeSingle();
      if (last.error) throw new Error("تعذر إنشاء رقم المنتج");
      const next = String(Number(last.data?.id ?? "0") + 1).padStart(5, "0");
      if (next.length > 5) throw new Error("تم الوصول للحد الأقصى لأرقام المنتجات");
      const result = await context.supabase.from("products").insert({ id: next, ...fields }).select("id").single();
      if (!result.error && result.data) return { id: result.data.id };
      if (result.error?.code !== "23505") throw new Error("تعذر إضافة المنتج");
    }
    throw new Error("تعذر إضافة المنتج؛ حاول مرة أخرى");
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().regex(/^\d{5}$/) }).parse(v))
  .handler(async ({ context, data }) => {
    if (!(await assertAdmin(context))) throw new Error("غير مسموح");
    // Past quote requests keep their own copy of names and prices, so deleting is safe for history.
    const result = await context.supabase.from("products").delete().eq("id", data.id).select("id").single();
    if (result.error || !result.data) throw new Error("تعذر حذف المنتج");
    return { success: true };
  });
