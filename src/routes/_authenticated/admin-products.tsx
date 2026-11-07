import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, RefreshCw, ImagePlus, Loader2, Star, EyeOff } from "lucide-react";
import { listAdminProducts, saveProduct, deleteProduct, productInputSchema, type ProductInput } from "@/lib/admin-products.functions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/AdminNav";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { availability, AVAILABILITY_LABELS, nf, CUR } from "@/lib/brand";
import { productImage } from "@/lib/product-images";

const options = queryOptions({ queryKey: ["admin-products"], queryFn: () => listAdminProducts() });
const PAGE = 50;

export const Route = createFileRoute("/_authenticated/admin-products")({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  head: () => ({ meta: [{ title: "إدارة المنتجات | لايت كرنت هاوس" }, { name: "description", content: "إدارة منتجات وأسعار ومخزون لايت كرنت هاوس." }, { name: "robots", content: "noindex" }] }),
  errorComponent: () => <main className="p-8"><p>تعذر تحميل المنتجات. سجّل الدخول بحساب الشركة وحاول مرة أخرى.</p><Button asChild className="mt-4"><Link to="/auth">دخول الشركة</Link></Button></main>,
  component: AdminProducts,
});

type Row = Awaited<ReturnType<typeof listAdminProducts>>["products"][number];
type Form = { id?: string; name: string; brand: string; category: string; model: string; description: string; price: string; stock: string; image_url: string | null; featured: boolean; active: boolean };
const emptyForm = (category: string): Form => ({ name: "", brand: "", category, model: "", description: "", price: "0", stock: "0", image_url: null, featured: false, active: true });

function AdminProducts() {
  const { data, isFetching } = useSuspenseQuery(options);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [show, setShow] = useState<"all" | "active" | "hidden" | "featured">("all");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Form | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);
  const catLabel = useMemo(() => Object.fromEntries(data.categories.map((c) => [c.key, c.label])), [data.categories]);

  const rows = useMemo(() => {
    const t = search.trim().toLowerCase();
    return data.products.filter((p) => (cat === "all" || p.category === cat)
      && (show === "all" || (show === "active" && p.active) || (show === "hidden" && !p.active) || (show === "featured" && p.featured))
      && (!t || `${p.id} ${p.name} ${p.model} ${p.brand}`.toLowerCase().includes(t)));
  }, [data.products, search, cat, show]);
  const pageRows = rows.slice(page * PAGE, page * PAGE + PAGE);
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["admin-products"] }), queryClient.invalidateQueries({ queryKey: ["catalog"] })]);
  const edit = (p: Row) => setEditing({ id: p.id, name: p.name, brand: p.brand, category: p.category, model: p.model, description: p.description, price: String(p.price), stock: String(p.stock), image_url: p.image_url, featured: p.featured, active: p.active });

  if (!data.allowed) return <main className="min-h-screen"><AdminNav current="products" /><section className="mx-auto max-w-6xl px-5 py-12"><h2 className="text-xl font-bold">الحساب غير مصرح له بإدارة المنتجات</h2><p className="mt-3 text-muted-foreground">استخدم بريد الشركة المعتمد بعد تأكيد ملكيته.</p></section></main>;

  return <main className="min-h-screen"><AdminNav current="products" /><div className="mx-auto max-w-6xl px-5 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-sm text-primary">مكتب الشركة</p><h1 className="mt-1 text-3xl font-bold">إدارة المنتجات</h1></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={isFetching} onClick={refresh}><RefreshCw />تحديث</Button><Button onClick={() => setEditing(emptyForm(data.categories[0]?.key ?? "misc"))}><Plus />إضافة منتج</Button></div>
    </div>
    <div className="mt-7 flex flex-wrap gap-3">
      <input aria-label="بحث المنتجات" placeholder="الاسم، الموديل، الماركة أو رقم المنتج" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} maxLength={100} className="h-11 min-w-0 flex-1 rounded-md border border-input bg-card px-3" />
      <select aria-label="التصنيف" value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} className="h-11 rounded-md border border-input bg-card px-3"><option value="all">كل التصنيفات</option>{data.categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
      <select aria-label="الحالة" value={show} onChange={(e) => { setShow(e.target.value as typeof show); setPage(0); }} className="h-11 rounded-md border border-input bg-card px-3"><option value="all">كل المنتجات</option><option value="active">الظاهرة في الموقع</option><option value="hidden">المخفية</option><option value="featured">اختيار الفنيين</option></select>
    </div>
    <p className="mt-3 text-sm text-muted-foreground">{nf(rows.length)} منتج من {nf(data.products.length)}</p>
    <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full text-sm">
      <thead className="border-b border-border bg-muted/50 text-muted-foreground"><tr><th className="p-3 text-start">المنتج</th><th className="p-3 text-start">التصنيف</th><th className="p-3 text-start">السعر</th><th className="p-3 text-start">المخزون</th><th className="p-3 text-start">الحالة</th><th className="p-3" /></tr></thead>
      <tbody>{pageRows.map((p) => <tr key={p.id} className={`border-b border-border last:border-0 ${p.active ? "" : "opacity-60"}`}>
        <td className="p-3"><div className="flex min-w-60 items-center gap-3"><img src={productImage({ n: p.name, m: p.model, c: p.category, img: p.image_url })} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded object-contain" /><div className="min-w-0"><b className="line-clamp-2 break-words">{p.name}</b><small dir="ltr" className="block text-muted-foreground">{p.id}{p.model && ` · ${p.model}`}{p.brand && ` · ${p.brand}`}</small></div></div></td>
        <td className="p-3 whitespace-nowrap">{catLabel[p.category] ?? p.category}</td>
        <td className="p-3 whitespace-nowrap">{nf(p.price)} {CUR}</td>
        <td className={`p-3 whitespace-nowrap ${p.stock <= 3 ? "text-destructive" : ""}`}>{nf(p.stock)} <small className="text-muted-foreground">({AVAILABILITY_LABELS[availability(p.stock)]})</small></td>
        <td className="p-3"><div className="flex flex-wrap gap-1">{!p.active && <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"><EyeOff className="h-3 w-3" />مخفي</span>}{p.featured && <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground"><Star className="h-3 w-3" />مميز</span>}</div></td>
        <td className="p-3"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label={`تعديل ${p.name}`} onClick={() => edit(p)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`حذف ${p.name}`} className="text-destructive" onClick={() => setConfirmDelete(p)}><Trash2 /></Button></div></td>
      </tr>)}</tbody>
    </table>{!rows.length && <p className="py-12 text-center text-muted-foreground">لا توجد منتجات مطابقة</p>}</div>
    {rows.length > PAGE && <div className="mt-6 flex items-center gap-3"><Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>السابق</Button><span className="text-sm text-muted-foreground">صفحة {nf(page + 1)} من {nf(Math.ceil(rows.length / PAGE))}</span><Button variant="outline" disabled={(page + 1) * PAGE >= rows.length} onClick={() => setPage((p) => p + 1)}>التالي</Button></div>}
  </div>
  {editing && <ProductDialog form={editing} categories={data.categories} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await refresh(); }} />}
  {confirmDelete && <DeleteDialog product={confirmDelete} onClose={() => setConfirmDelete(null)} onDeleted={async () => { setConfirmDelete(null); await refresh(); }} />}
  </main>;
}

function ProductDialog({ form: initial, categories, onClose, onSaved }: { form: Form; categories: { key: string; label: string }[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const save = useServerFn(saveProduct);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: "", submit: "" })); };

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setErrors((e) => ({ ...e, image_url: "الصورة لازم تكون JPG أو PNG أو WEBP وأقل من ٥ ميجا" })); return; }
    setUploading(true);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${form.id ?? "new"}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (error) throw error;
      set("image_url", supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    } catch { setErrors((e) => ({ ...e, image_url: "تعذر رفع الصورة" })); }
    finally { setUploading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const input: ProductInput = { ...form, price: form.price.trim() === "" ? NaN : Number(form.price), stock: form.stock.trim() === "" ? NaN : Number(form.stock) };
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setBusy(true);
    try { await save({ data: parsed.data }); await onSaved(); }
    catch { setErrors({ submit: "تعذر حفظ المنتج؛ حاول مرة أخرى" }); }
    finally { setBusy(false); }
  }

  const field = "h-11 w-full rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring";
  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-destructive">{errors[k]}</p>;
  return <Dialog open onOpenChange={(o) => { if (!o && !busy) onClose(); }}>
    <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogTitle>{form.id ? `تعديل المنتج ${form.id}` : "إضافة منتج جديد"}</DialogTitle>
      <DialogDescription>السعر والمخزون لا يظهروا للزوار؛ الموقع يعرض حالة التوفر فقط.</DialogDescription>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="p-name" className="mb-1.5 block text-sm font-medium">اسم المنتج *</label><input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={200} className={field} />{err("name")}</div>
        <div><label htmlFor="p-brand" className="mb-1.5 block text-sm font-medium">الماركة</label><input id="p-brand" dir="ltr" value={form.brand} onChange={(e) => set("brand", e.target.value)} maxLength={60} className={field} /></div>
        <div><label htmlFor="p-model" className="mb-1.5 block text-sm font-medium">رقم الموديل</label><input id="p-model" dir="ltr" value={form.model} onChange={(e) => set("model", e.target.value)} maxLength={100} className={field} /></div>
        <div><label htmlFor="p-cat" className="mb-1.5 block text-sm font-medium">التصنيف *</label><select id="p-cat" value={form.category} onChange={(e) => set("category", e.target.value)} className={field}>{categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>{err("category")}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="p-price" className="mb-1.5 block text-sm font-medium">السعر ({CUR})</label><input id="p-price" type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} className={field} />{err("price")}</div>
          <div><label htmlFor="p-stock" className="mb-1.5 block text-sm font-medium">المخزون</label><input id="p-stock" type="number" min={0} step={1} value={form.stock} onChange={(e) => set("stock", e.target.value)} className={field} />{err("stock")}</div>
        </div>
        <div className="sm:col-span-2"><label htmlFor="p-desc" className="mb-1.5 block text-sm font-medium">الوصف</label><textarea id="p-desc" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} rows={3} className="w-full rounded-md border border-input bg-background p-3 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <div className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">صورة المنتج</span><div className="flex flex-wrap items-center gap-4">
          <img src={productImage({ n: form.name, m: form.model, c: form.category, img: form.image_url })} alt="" width={80} height={80} className="h-20 w-20 rounded-md border border-border object-contain" />
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:bg-muted">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{form.image_url ? "تغيير الصورة" : "رفع صورة حقيقية"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} /></label>
          {form.image_url && <Button type="button" variant="ghost" size="sm" onClick={() => set("image_url", null)}>استخدام الصورة التوضيحية</Button>}
        </div>{err("image_url")}</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />ظاهر في الموقع</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4" />اختيار الفنيين (يظهر في المميز)</label>
        {errors["submit"] && <p role="alert" className="text-sm text-destructive sm:col-span-2">{errors["submit"]}</p>}
        <div className="flex gap-3 sm:col-span-2"><Button type="submit" disabled={busy || uploading} className="h-11 flex-1">{busy && <Loader2 className="animate-spin" />}حفظ المنتج</Button><Button type="button" variant="outline" disabled={busy} onClick={onClose} className="h-11">إلغاء</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

function DeleteDialog({ product, onClose, onDeleted }: { product: Row; onClose: () => void; onDeleted: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remove = useServerFn(deleteProduct);
  async function confirm() { setBusy(true); setError(""); try { await remove({ data: { id: product.id } }); await onDeleted(); } catch { setError("تعذر حذف المنتج"); } finally { setBusy(false); } }
  return <Dialog open onOpenChange={(o) => { if (!o && !busy) onClose(); }}>
    <DialogContent dir="rtl">
      <DialogTitle>حذف المنتج نهائيًا؟</DialogTitle>
      <DialogDescription>«{product.name}» هيتشال من الموقع وقاعدة البيانات. طلبات عروض السعر القديمة هتفضل محتفظة بيه. لو عايز تخفيه مؤقتًا بس، عدّل المنتج وشيل علامة «ظاهر في الموقع».</DialogDescription>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3"><Button variant="destructive" disabled={busy} onClick={confirm}>{busy && <Loader2 className="animate-spin" />}حذف</Button><Button variant="outline" disabled={busy} onClick={onClose}>إلغاء</Button></div>
    </DialogContent>
  </Dialog>;
}
