import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Minus, FileText, ArrowRight, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PRODUCTS, nf } from "@/lib/brand";
import { productImage } from "@/lib/product-images";
import { customerSchema, quoteSchema, type Customer, type QuoteInput } from "@/lib/quote";
import { submitQuote } from "@/lib/quotes.functions";

const emptyCustomer: Customer = { name: "", phone: "", email: "", company: "", address: "", notes: "" };
export function QuoteCart({ open, onOpenChange, cart, onAdd }: { open: boolean; onOpenChange: (open: boolean) => void; cart: Record<string, number>; onAdd: (id: string, delta: number) => void }) {
  const [step, setStep] = useState<"cart" | "details" | "success">("cart");
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [requestKey, setRequestKey] = useState("");
  const [result, setResult] = useState<{ id: string } | null>(null);
  const save = useServerFn(submitQuote);
  const products = PRODUCTS.filter((p) => (cart[p.id] ?? 0) > 0);
  const update = (key: keyof Customer, value: string) => { setCustomer((c) => ({ ...c, [key]: value })); setErrors((e) => ({ ...e, [key]: "", submit: "" })); setRequestKey(""); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = customerSchema.safeParse(customer);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    const key = requestKey || crypto.randomUUID();
    setRequestKey(key);
    const input: QuoteInput = { requestKey: key, customer: parsed.data, items: products.map((p) => ({ id: p.id, quantity: cart[p.id] ?? 0 })) };
    const checked = quoteSchema.safeParse(input);
    if (!checked.success) { setErrors({ submit: "راجع المنتجات والكميات قبل إرسال الطلب" }); return; }
    setBusy(true); setErrors({});
    try {
      const saved = await save({ data: checked.data });
      setResult({ id: saved.id });
      setStep("success");
    } catch { setErrors({ submit: "تعذر حفظ طلبك الآن. جرّب مرة أخرى؛ المنتجات ما زالت في السلة." }); }
    finally { setBusy(false); }
  };
  return <Sheet open={open} onOpenChange={(value) => { if (!busy) onOpenChange(value); }}>
    <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg" dir="rtl">
      <div className="border-b border-border px-6 pb-5 pt-12">
        <SheetTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{step === "cart" ? "سلة عرض السعر" : step === "details" ? "بيانات العميل" : "تم تسجيل طلبك"}</SheetTitle>
        <SheetDescription className="mt-2">{step === "success" ? "وصل طلبك إلى الشركة للمراجعة والتواصل معك." : "سجّل المنتجات والكميات، وستوصل الأسعار معك في عرض السعر النهائي."}</SheetDescription>
      </div>
      {step === "cart" && <>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!products.length && <p className="py-12 text-center text-muted-foreground">السلة فارغة</p>}
          {products.map((p) => <div key={p.id} className="flex gap-3 border-b border-border pb-4">
            <img src={productImage(p)} width={80} height={80} alt="صورة توضيحية" className="h-20 w-20 shrink-0 rounded-md object-contain" />
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{p.n}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => onAdd(p.id, 1)} disabled={(cart[p.id] ?? 0) >= 999} aria-label="زيادة"><Plus /></Button><span className="min-w-6 text-center">{nf(cart[p.id] ?? 0)}</span><Button variant="outline" size="icon" onClick={() => onAdd(p.id, -1)} aria-label="إنقاص"><Minus /></Button></div>
              <Button variant="ghost" size="sm" onClick={() => onAdd(p.id, -(cart[p.id] ?? 0))} className="text-destructive"><Trash2 />حذف</Button>
            </div></div>
          </div>)}
        </div>
        <div className="border-t border-border p-5"><Button disabled={!products.length} onClick={() => { setStep("details"); setRequestKey(""); }} className="h-12 w-full"><FileText />طلب عرض سعر</Button><Button variant="outline" onClick={() => onOpenChange(false)} className="mt-3 h-11 w-full"><ArrowRight />الرجوع للمنتجات وإضافة المزيد</Button></div>
      </>}
      {step === "details" && <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Button type="button" variant="ghost" disabled={busy} onClick={() => setStep("cart")} className="px-0"><ArrowRight />الرجوع للسلة لتعديل المنتجات والكميات</Button>
          {([{ key: "name", label: "اسم العميل", required: true, max: 100, auto: "name" }, { key: "phone", label: "رقم الهاتف / واتساب", required: true, max: 16, auto: "tel", type: "tel" }, { key: "email", label: "البريد الإلكتروني (اختياري)", max: 255, auto: "email", type: "email" }, { key: "company", label: "الشركة (اختياري)", max: 150, auto: "organization" }, { key: "address", label: "المحافظة / العنوان (اختياري)", max: 300, auto: "street-address" }] as const).map((f) => <div key={f.key}><label htmlFor={`quote-${f.key}`} className="mb-1.5 block text-sm font-medium">{f.label}{"required" in f && " *"}</label><input id={`quote-${f.key}`} value={customer[f.key]} disabled={busy} onChange={(e) => update(f.key, e.target.value)} type={"type" in f ? f.type : "text"} autoComplete={f.auto} maxLength={f.max} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key] ? `error-${f.key}` : undefined} className="h-11 w-full rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring" />{errors[f.key] && <p id={`error-${f.key}`} className="mt-1 text-sm text-destructive">{errors[f.key]}</p>}</div>)}
          <div><label htmlFor="quote-notes" className="mb-1.5 block text-sm font-medium">تفاصيل المشروع / ملاحظات (اختياري)</label><textarea id="quote-notes" value={customer.notes} disabled={busy} onChange={(e) => update("notes", e.target.value)} maxLength={1000} rows={3} className="w-full rounded-md border border-input bg-background p-3 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <p className="text-xs text-muted-foreground">تُستخدم بياناتك للتواصل بخصوص عرض السعر المطلوب فقط.</p>
          {errors["submit"] && <p role="alert" className="text-sm text-destructive">{errors["submit"]}</p>}
        </div>
        <div className="border-t border-border p-5"><div className="flex justify-between text-sm"><span>{nf(products.length)} صنف</span></div><Button type="submit" disabled={busy || !products.length} className="mt-4 h-12 w-full">{busy ? <Loader2 className="animate-spin" /> : <FileText />}{busy ? "جارٍ حفظ الطلب…" : "تسجيل طلب عرض السعر"}</Button></div>
      </form>}
      {step === "success" && result && <div className="flex-1 overflow-y-auto p-6"><CheckCircle2 className="mb-5 h-12 w-12 text-primary" /><h3 className="text-xl font-bold">تم استلام طلب عرض السعر</h3><p className="mt-3 text-sm text-muted-foreground">فريق لايت كرنت هاوس يراجع المنتجات والكميات ويتواصل معك على بياناتك المسجلة لتقديم عرض السعر النهائي؛ لا تحتاج لإرساله مرة أخرى.</p><p className="mt-5 text-xs text-muted-foreground">رقم الطلب</p><p dir="ltr" className="mt-1 break-all font-display text-sm">{result.id}</p><Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>متابعة التصفح</Button><Button variant="outline" className="mt-3 w-full" onClick={() => { setStep("cart"); setRequestKey(""); setResult(null); }}>العودة للسلة</Button></div>}
    </SheetContent>
  </Sheet>;
}