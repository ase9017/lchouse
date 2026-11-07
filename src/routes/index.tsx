import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search, ShieldCheck, Zap, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { SiteHeader, Logo } from "@/components/SiteHeader";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ALL_CATEGORY, AVAILABILITY_LABELS, CONTACT, nf, type Product } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { QuoteCart } from "@/components/QuoteCart";
import { cleanCart } from "@/lib/quote";
import { productImage, hasRealPhoto } from "@/lib/product-images";
import { catalogQuery } from "@/lib/catalog.functions";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: "لايت كرنت هاوس | كاميرات المراقبة والشبكات" },
      { name: "description", content: "كاميرات، مسجلات، شبكات، وإكسسوارات وأدوات إلكترونية: هاردات، فلاشات، كروت ذاكرة وأجهزة، بموديلات واضحة." },
      { property: "og:title", content: "لايت كرنت هاوس | كاميرات المراقبة والشبكات" },
      { property: "og:description", content: "كاميرات، مسجلات، شبكات، هاردات، فلاشات وإكسسوارات إلكترونية بموديلات واضحة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const PRODUCTS = catalog.products;
  const CATS = useMemo(() => [ALL_CATEGORY, ...catalog.categories], [catalog.categories]);
  const byId = useMemo(() => Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>, [PRODUCTS]);
  const featured = useMemo(() => PRODUCTS.filter((p) => p.f), [PRODUCTS]);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(24);
  const [cart, setCart] = useState<Record<string, number>>({} as Record<string, number>);
  const [open, setOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    try { setCart(cleanCart(JSON.parse(localStorage.getItem("lch-cart") || "{}"), new Set(PRODUCTS.map((p) => p.id)))); } catch {}
    setCartReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore the saved cart once on mount
  }, []);
  useEffect(() => { if (cartReady) { try { localStorage.setItem("lch-cart", JSON.stringify(cart)); } catch {} } }, [cart, cartReady]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = PRODUCTS.filter((i) => (cat === "all" || i.c === cat) && (!t || `${i.n} ${i.m} ${i.id} ${i.d}`.toLowerCase().includes(t)));
    return r;
  }, [PRODUCTS, cat, q]);

  const add = (id: string, d = 1) =>
    setCart((c) => {
      if (!byId[id] || (!c[id] && Object.keys(c).length >= 100)) return c;
      const n = { ...c, [id]: Math.min(999, (c[id] || 0) + d) };
      if ((n[id] ?? 0) <= 0) delete n[id];
      return n;
    });
  const addFromCatalog = (id: string, source: "featured" | "catalog") => {
    add(id);
    window.__lovableEvents?.track?.("project.product_added_to_cart", { product_id: id, category: byId[id]?.c ?? "", source });
  };
  const ids = Object.keys(cart).filter((k) => byId[k]);
  const count = ids.reduce((s, k) => s + (cart[k] ?? 0), 0);

  return (
    <div className="min-h-screen">
      <div className="bg-ink py-2 text-center text-xs text-ink-foreground">معدات مختارة بعناية، ومعلومات واضحة لكل موديل</div>
      <SiteHeader
        right={
          <Button onClick={() => setOpen(true)} className="flex h-11 items-center gap-2 px-4 font-semibold">
            <ShoppingBag className="h-4 w-4" /> السلة
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{nf(count)}</span>
          </Button>
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
            <p className="mt-6 max-w-lg text-lg opacity-80">كاميرات، مسجلات، وشبكات، بالإضافة إلى الإكسسوارات والأدوات الإلكترونية من هاردات وفلاشات وكروت ذاكرة وأجهزة، للمركّبين وأصحاب الأعمال والأفراد. موديلات معروفة، مواصفات واضحة، واختيار أسهل من أول زيارة.</p>
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
          {featured.map((p) => <Card key={p.id} p={p} feat onAdd={() => addFromCatalog(p.id, "featured")} />)}
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
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATS.map(({ key: k, label: l }) => (
              <Button key={k} variant={cat === k ? "default" : "outline"} onClick={() => { setCat(k); setShown(24); }} className="h-auto whitespace-normal rounded-full px-4 py-1.5 text-sm">{l}</Button>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.slice(0, shown).map((p) => <Card key={p.id} p={p} onAdd={() => addFromCatalog(p.id, "catalog")} />)}
          </div>
          {!list.length && <p className="py-16 text-center text-muted-foreground">لا توجد نتائج مطابقة. جرّب اسماً أو رقم موديل آخر.</p>}
          {list.length > shown && <div className="mt-10 text-center"><Button variant="outline" onClick={() => setShown((s) => s + 24)} className="h-11 px-8 font-semibold text-primary">عرض المزيد</Button></div>}
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
        <h2 className="text-3xl font-bold">من نحن</h2>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">لايت كرنت هاوس متجر متخصص في كاميرات المراقبة وأجهزة التسجيل والشبكات وملحقات التركيب، إلى جانب الإكسسوارات والأدوات الإلكترونية عموماً مثل الهاردات والفلاشات وكروت الذاكرة والأجهزة والإكسسوارات، نخدم المركّبين وأصحاب الأعمال والأفراد. نؤمن أن الاختيار الصحيح يبدأ من معلومة واضحة.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[["رؤيتنا", "أن نكون الوجهة الأولى الموثوقة لمعدات الأمن والمراقبة، حيث يجد كل مركّب وصاحب عمل ما يحتاجه بثقة."], ["رسالتنا", "توفير معدات مراقبة وشبكات بموديلات واضحة ومعلومات دقيقة عن كل جهاز، ومساعدة العميل على اختيار الأنسب لمشروعه."], ["هدفنا", "تبسيط رحلة الشراء، ورفع جودة التركيبات، وبناء علاقات طويلة قائمة على الوضوح والالتزام."]].map(([t, d], i) => (
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
          <div><Logo light /><p className="mt-4 text-sm opacity-70">توافر المنتجات والكميات حسب آخر جرد للمخزن وقد يتغير دون إشعار؛ تُرسل الأسعار في عرض السعر.</p></div>
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

      <QuoteCart open={open} onOpenChange={setOpen} cart={cart} onAdd={add} products={PRODUCTS} />
    </div>
  );
}

function Card({ p, feat, onAdd }: { p: Product; feat?: boolean; onAdd: () => void }) {
  const st = AVAILABILITY_LABELS[p.a];
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative h-48 shrink-0 overflow-hidden bg-card">
        <img src={productImage(p)} alt={hasRealPhoto(p) ? p.n : `صورة توضيحية — ${p.n}`} loading="lazy" width={512} height={512} className="absolute inset-0 h-full w-full object-contain p-5" />
        {!hasRealPhoto(p) && <span className="absolute bottom-2 start-3 rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">صورة توضيحية</span>}
        {p.b && <span dir="ltr" className="absolute end-3 top-3 font-display text-[10px] font-bold tracking-widest text-muted-foreground">{p.b.toUpperCase()}</span>}
        {feat && <span className="absolute start-3 top-3 rounded bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">اختيار الفنيين</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold">{p.n}</h3>
        {p.m && <span dir="ltr" className="mt-1 self-start rounded bg-muted px-2 font-display text-xs">{p.m}</span>}
        <span className={`mt-2 text-xs ${p.a !== "in" ? "text-destructive" : "text-primary"}`}>● {st}</span>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">تُرسل الأسعار في عرض السعر</span>
          <Button size="sm" onClick={onAdd} className="font-semibold">أضف للسلة</Button>
        </div>
      </div>
    </article>
  );
}
