import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AVAILABILITY_LABELS, nf, type Product } from "@/lib/brand";
import { hasRealPhoto, productImage } from "@/lib/product-images";

type CartControls = { qty: number; onAdd: (delta: number) => void };

/** "Add to cart" until the product is in the cart, then a − quantity + stepper. */
function QtyControl({ qty, onAdd, name, large }: CartControls & { name: string; large?: boolean }) {
  if (!qty) return <Button size={large ? "default" : "sm"} onClick={() => onAdd(1)} className={`font-semibold ${large ? "h-11 px-6" : ""}`}><ShoppingBag />أضف للسلة</Button>;
  return (
    <div className="flex items-center gap-1 rounded-md border border-primary/30 bg-secondary p-0.5">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAdd(1)} disabled={qty >= 999} aria-label={`زيادة كمية ${name}`}><Plus /></Button>
      <span className="min-w-7 text-center text-sm font-bold" aria-live="polite">{nf(qty)}</span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAdd(-1)} aria-label={`إنقاص كمية ${name}`}><Minus /></Button>
    </div>
  );
}

function Availability({ p }: { p: Product }) {
  return <span className={`text-xs ${p.a !== "in" ? "text-destructive" : "text-primary"}`}>● {AVAILABILITY_LABELS[p.a]}</span>;
}

export function ProductCard({ p, feat, qty, onAdd, onOpen }: CartControls & { p: Product; feat?: boolean; onOpen: () => void }) {
  return (
    <article className={`flex flex-col overflow-hidden rounded-lg border bg-card transition hover:-translate-y-0.5 hover:shadow-card ${qty ? "border-primary/50" : "border-border"}`}>
      <button type="button" onClick={onOpen} aria-label={`تفاصيل ${p.n}`} className="relative block h-48 w-full shrink-0 cursor-pointer overflow-hidden bg-card focus-visible:outline-2 focus-visible:outline-ring">
        <img src={productImage(p)} alt={hasRealPhoto(p) ? p.n : `صورة توضيحية — ${p.n}`} loading="lazy" width={512} height={512} className="absolute inset-0 h-full w-full object-contain p-5" />
        {!hasRealPhoto(p) && <span className="absolute bottom-2 start-3 rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">صورة توضيحية</span>}
        {p.b && <span dir="ltr" className="absolute end-3 top-3 font-display text-[10px] font-bold tracking-widest text-muted-foreground">{p.b.toUpperCase()}</span>}
        {feat && <span className="absolute start-3 top-3 rounded bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">اختيار الفنيين</span>}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold"><button type="button" onClick={onOpen} className="cursor-pointer text-start hover:text-primary">{p.n}</button></h3>
        {p.m && <span dir="ltr" className="mt-1 self-start rounded bg-muted px-2 font-display text-xs">{p.m}</span>}
        <span className="mt-2"><Availability p={p} /></span>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <button type="button" onClick={onOpen} className="cursor-pointer text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline">التفاصيل</button>
          <QtyControl qty={qty} onAdd={onAdd} name={p.n} />
        </div>
      </div>
    </article>
  );
}

export function ProductDialog({ p, categoryLabel, qty, onAdd, onClose, onViewCart }: CartControls & { p: Product | undefined; categoryLabel?: string | undefined; onClose: () => void; onViewCart: () => void }) {
  return (
    <Dialog open={!!p} onOpenChange={(open) => { if (!open) onClose(); }}>
      {p && (
        <DialogContent dir="rtl" className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
          <div className="relative h-64 bg-card">
            <img src={productImage(p)} alt={hasRealPhoto(p) ? p.n : `صورة توضيحية — ${p.n}`} width={512} height={512} className="absolute inset-0 h-full w-full object-contain p-6" />
            {!hasRealPhoto(p) && <span className="absolute bottom-3 start-4 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">صورة توضيحية — قد يختلف شكل الموديل</span>}
          </div>
          <div className="border-t border-border p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {categoryLabel && <span className="rounded-full bg-secondary px-3 py-1">{categoryLabel}</span>}
              {p.b && <span dir="ltr" className="font-display font-bold tracking-widest text-muted-foreground">{p.b.toUpperCase()}</span>}
            </div>
            <DialogTitle className="mt-3 text-start text-xl leading-snug">{p.n}</DialogTitle>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {p.m && <><dt className="text-muted-foreground">الموديل</dt><dd dir="ltr" className="justify-self-start rounded bg-muted px-2 font-display">{p.m}</dd></>}
              <dt className="text-muted-foreground">كود المنتج</dt><dd dir="ltr" className="justify-self-start font-display">{p.id}</dd>
              <dt className="text-muted-foreground">التوافر</dt><dd><Availability p={p} /></dd>
            </dl>
            <DialogDescription className="mt-4 whitespace-pre-line text-start text-sm leading-relaxed">
              {p.d.trim() || "لمعرفة المواصفات الكاملة لهذا الموديل، أضفه إلى السلة واطلب عرض سعر أو اسأل المساعد الذكي."}
            </DialogDescription>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <span className="text-xs text-muted-foreground">السعر يصلك في عرض السعر</span>
              <div className="flex items-center gap-2">
                {qty > 0 && <Button variant="outline" onClick={onViewCart}>عرض السلة</Button>}
                <QtyControl qty={qty} onAdd={onAdd} name={p.n} large />
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
