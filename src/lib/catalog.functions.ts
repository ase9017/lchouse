import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { availability, type Category, type Product } from "./brand";

// Public read-only catalogue. Selects only safe columns: price and exact stock never leave the server.
export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [products, categories] = await Promise.all([
    supabaseAdmin.from("products").select("id, name, brand, category, model, description, image_url, featured, stock").eq("active", true).order("id"),
    supabaseAdmin.from("product_categories").select("key, label").order("sort_order"),
  ]);
  if (products.error || categories.error) throw new Error("تعذر تحميل المنتجات");
  return {
    products: products.data.map((p): Product => ({ id: p.id, n: p.name, b: p.brand, c: p.category, m: p.model, d: p.description, img: p.image_url, f: p.featured, a: availability(p.stock) })),
    categories: categories.data as Category[],
  };
});

export const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog(), staleTime: 60_000 });
