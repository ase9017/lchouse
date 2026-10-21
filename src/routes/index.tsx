import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Camera, HardDrive, Network, Cable, Package, ShoppingBag, Search, X, Plus, Minus, ShieldCheck, Zap, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { SiteHeader, Logo } from "@/components/SiteHeader";
import { PRODUCTS, FEATURED, CATS, CONTACT, nf, CUR, type Product } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "لايت كرنت هاوس | كاميرات المراقبة والشبكات" },
      { name: "description", content: "كاميرات، مسجلات، وشبكات للمركّبين وأصحاب الأعمال بموديلات وأسعار واضحة." },
      { property: "og:title", content: "لايت كرنت هاوس | كاميرات المراقبة والشبكات" },
      { property: "og:description", content: "كاميرات، مسجلات، وشبكات بموديلات وأسعار واضحة." },
    ],
  }),
  component: Index,
});

const ICONS: Record<string, typeof Camera> = { cam: Camera, rec: HardDrive, net: Network, acc: Cable, misc: Package };
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

function Index() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("def");
  const [shown, setShown] = useState(24);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("lch-cart") || "{}")); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("lch-cart", JSON.stringify(cart)); }, [cart]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = PRODUCTS.filter((i) => (cat === "all" || i.c === cat) && (!t || `${i.n} ${i.m} ${i.id} ${i.d}`.toLowerCase().includes(t)));
    if (sort === "pa") r.sort((a, b) => a.p - b.p);
    if (sort === "pd") r.sort((a, b) => b.p - a.p);
    return r;
  }, [cat, q, sort]);

  const add = (id: string, d = 1) =>
    setCart((c) => {
      const n = { ...c, [id]: (c[id] || 0) + d };
      if (n[id] <= 0) delete n[id];
      return n;
    });
  const ids = Object.keys(cart).filter((k) => byId[k]);
  const count = ids.reduce((s, k) => s + cart[k], 0);
  const total = ids.reduce((s, k) => s + cart[k] * byId[k].p, 0);
  const sendOrder = () => {
    const msg = "طلب جديد - لايت كرنت هاوس\n" + ids.map((k) => `• ${byId[k].n} × ${cart[k]} = ${byId[k].p * cart[k]} ${CUR}`).join("\n") + `\nالإجمالي: ${total} ${CUR}`;
    window.open(`https://wa.me/${CONTACT.wa}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <div className="bg-ink py-2 text-center text-xs text-ink-foreground">معدات مختارة بعناية، ومعلومات واضحة لكل موديل</div>
      <SiteHeader
        right={
          <button onClick={() => setOpen(true)} className="flex h-11 items-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground">
            <ShoppingBag className="h-4 w-4" /> السلة
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{nf(count)}</span>
          </button>
        }
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-gradient text-ink-foreground">
        <div className="grid-lines absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.3fr_1fr] md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 px-3 py-1 text-xs">
              <Zap className="h-3.5 w-3.5 text-accent" /> تجهيزات الأمن والمراقبة للمحترفين
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              كل ما يثبت النظام.<br /><span className="text-accent">ولا يترك مجالاً للشك.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg opacity-80">كاميرات، مسجلات، وشبكات للمركّبين وأصحاب الأعمال. موديلات معروفة، مواصفات واضحة، واختيار أسهل من أول زيارة.</p>
            <a href="#products" className="mt-8 inline-flex h-12 items-center rounded-md bg-accent px-6 font-semibold text-accent-foreground">اكتشف المنتجات ←</a>
          </div>
          <div className="grid content-center gap-3">
            {[[ShieldCheck, "موديل واضح قبل الطلب", "رقم المنتج ظاهر وسهل التحقق"], [Zap, "حلول متكاملة للتركيب", "من الكاميرا حتى كابل الشبكة"], [Clock, "اختيار أسرع للمختصين", "تصنيفات عملية بلا تشتيت"]].map(([I, t, d]: any) => (
              <div key={t} className="flex items-start gap-4 rounded-lg border border-ink-foreground/15 bg-ink-foreground/5 p-4">
                <I className="mt-1 h-5 w-5 text-accent" />
                <div><b className="block">{t}</b><span className="text-sm opacity-70">{d}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold text-primary">مختارة للميدان</p>
        <h2 className="mt-1 text-3xl font-bold">معدات تثق بها في كل تركيب</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((id) => byId[id] && <Card key={id} p={byId[id]} feat onAdd={() => add(id)} />)}
        </div>
      </section>

      {/* Catalog */}
      <section id="products" className="scroll-mt-24 border-y border-border bg-muted/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-semibold text-primary">الكتالوج الكامل</p><h2 className="text-3xl font-bold">كل المنتجات</h2></div>
            <span className="text-sm text-muted-foreground">{nf(list.length)} صنف</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => { setQ(e.target.value); setShown(24); }} placeholder="ابحث بالاسم أو رقم الموديل" className="h-11 w-full rounded-md border border-input bg-card ps-10 pe-3" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-md border border-input bg-card px-3">
              <option value="def">الترتيب الافتراضي</option><option value="pa">السعر: الأقل أولاً</option><option value="pd">السعر: الأعلى أولاً</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATS.map(([k, l]) => (
              <button key={k} onClick={() => { setCat(k); setShown(24); }} className={`rounded-full border px-4 py-1.5 text-sm ${cat === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{l}</button>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.slice(0, shown).map((p) => <Card key={p.id} p={p} onAdd={() => add(p.id)} />)}
          </div>
          {!list.length && <p className="py-16 text-center text-muted-foreground">لا توجد نتائج مطابقة. جرّب اسماً أو رقم موديل آخر.</p>}
          {list.length > shown && <div className="mt-10 text-center"><button onClick={() => setShown((s) => s + 24)} className="h-11 rounded-md border border-primary px-8 font-semibold text-primary">عرض المزيد</button></div>}
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 className="text-3xl font-bold">من نحن</h2>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">لايت كرنت هاوس متجر متخصص في كاميرات المراقبة وأجهزة التسجيل والشبكات وملحقات التركيب، نخدم المركّبين وأصحاب الأعمال والأفراد. نؤمن أن الاختيار الصحيح يبدأ من معلومة واضحة.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[["رؤيتنا", "أن نكون الوجهة الأولى الموثوقة لمعدات الأمن والمراقبة، حيث يجد كل مركّب وصاحب عمل ما يحتاجه بثقة."], ["رسالتنا", "توفير معدات مراقبة وشبكات بموديلات واضحة وأسعار شفافة، ومساعدة العميل على اختيار الأنسب لمشروعه."], ["هدفنا", "تبسيط رحلة الشراء، ورفع جودة التركيبات، وبناء علاقات طويلة قائمة على الوضوح والالتزام."]].map(([t, d], i) => (
            <div key={t} className="rounded-lg border border-border bg-card p-6 shadow-card">
              <span className="font-display text-sm font-bold text-primary">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <footer className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-2">
          <div><Logo light /><p className="mt-4 text-sm opacity-70">الأسعار والكميات حسب آخر جرد للمخزن وقد تتغير دون إشعار.</p></div>
          <div>
            <h2 className="text-2xl font-bold">تواصل معنا</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`https://wa.me/${CONTACT.wa}`} className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 font-semibold text-accent-foreground"><MessageCircle className="h-4 w-4" />واتساب</a>
              <a href={`tel:${CONTACT.phone}`} className="inline-flex h-11 items-center gap-2 rounded-md border border-ink-foreground/30 px-4"><Phone className="h-4 w-4" /><span dir="ltr">{CONTACT.phone}</span></a>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex h-11 items-center gap-2 rounded-md border border-ink-foreground/30 px-4"><Mail className="h-4 w-4" />{CONTACT.email}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 flex w-full max-w-md flex-col bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border p-5"><h3 className="text-lg font-bold">سلة الطلب</h3><button onClick={() => setOpen(false)} aria-label="إغلاق"><X /></button></div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {!ids.length && <p className="py-10 text-center text-muted-foreground">السلة فارغة</p>}
              {ids.map((k) => (
                <div key={k} className="rounded-md border border-border p-3">
                  <p className="text-sm">{byId[k].n}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => add(k, 1)} aria-label="زيادة" className="rounded border border-border p-1"><Plus className="h-3 w-3" /></button>
                      {nf(cart[k])}
                      <button onClick={() => add(k, -1)} aria-label="إنقاص" className="rounded border border-border p-1"><Minus className="h-3 w-3" /></button>
                    </div>
                    <b>{nf(byId[k].p * cart[k])} {CUR}</b>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-5">
              <div className="flex justify-between text-lg font-bold"><span>الإجمالي</span><span>{nf(total)} {CUR}</span></div>
              <button disabled={!ids.length} onClick={sendOrder} className="mt-4 h-12 w-full rounded-md bg-primary font-semibold text-primary-foreground disabled:opacity-50">إرسال الطلب عبر واتساب</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Card({ p, feat, onAdd }: { p: Product; feat?: boolean; onAdd: () => void }) {
  const I = ICONS[p.c] || Package;
  const st = p.s <= 1 ? "آخر قطعة" : p.s <= 3 ? "كمية محدودة" : "متوفر";
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative grid h-36 place-items-center bg-secondary">
        <I className="h-14 w-14 text-primary" strokeWidth={1.2} />
        {p.b && <span dir="ltr" className="absolute end-3 top-3 font-display text-[10px] font-bold tracking-widest text-muted-foreground">{p.b.toUpperCase()}</span>}
        {feat && <span className="absolute start-3 top-3 rounded bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">اختيار الفنيين</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold">{p.n}</h3>
        {p.m && <span dir="ltr" className="mt-1 self-start rounded bg-muted px-2 font-display text-xs">{p.m}</span>}
        <span className={`mt-2 text-xs ${p.s <= 3 ? "text-destructive" : "text-primary"}`}>● {st}</span>
        <div className="mt-auto flex items-center justify-between pt-4">
          <b className="text-lg">{nf(p.p)} <small className="text-xs font-normal">{CUR}</small></b>
          <button onClick={onAdd} className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">أضف للسلة</button>
        </div>
      </div>
    </article>
  );
}
