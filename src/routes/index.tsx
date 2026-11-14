import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search, ShieldCheck, Zap, Clock, Phone, Mail, MessageCircle, X, ListChecks, Send, FileCheck2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteHeader, Logo } from "@/components/SiteHeader";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ALL_CATEGORY, CONTACT, nf, type Product } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { QuoteCart } from "@/components/QuoteCart";
import { ChatWidget } from "@/components/ChatWidget";
import { cleanCart } from "@/lib/quote";
import { ProductCard, ProductDialog } from "@/components/ProductCard";
import { matchesWords, queryWords, searchText } from "@/lib/search";
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
      { property: "og:locale", content: "ar_EG" },
      { property: "og:site_name", content: "لايت كرنت هاوس" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(STORE_SCHEMA) }],
  }),
  component: Index,
});

const WA_URL = `https://wa.me/${CONTACT.wa}`;
const STORE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: "لايت كرنت هاوس",
  alternateName: "Light Current House",
  description: "كاميرات مراقبة، مسجلات، شبكات وإكسسوارات إلكترونية.",
  telephone: `+${CONTACT.wa}`,
  email: CONTACT.email,
  areaServed: "EG",
};
const brandOf = (p: Product) => p.b.trim().toUpperCase();
const HOW_STEPS = [
  [ListChecks, "اختر منتجاتك", "تصفّح الكتالوج أو اسأل المساعد الذكي، وأضف ما تحتاجه إلى السلة بالكميات المطلوبة."],
  [Send, "أرسل طلب عرض السعر", "اكتب اسمك ورقم هاتفك فقط، ويصل طلبك مباشرة إلى فريق الشركة."],
  [FileCheck2, "استلم العرض النهائي", "نراجع التوافر ونتواصل معك بعرض السعر النهائي على بياناتك المسجلة."],
] as const;

function Index() {
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const PRODUCTS = catalog.products;
  const CATS = useMemo(() => [ALL_CATEGORY, ...catalog.categories], [catalog.categories]);
  const byId = useMemo(() => Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>, [PRODUCTS]);
  const featured = useMemo(() => PRODUCTS.filter((p) => p.f), [PRODUCTS]);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
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

  const indexed = useMemo(() => PRODUCTS.map((p) => ({ p, text: searchText(p) })), [PRODUCTS]);
  const found = useMemo(() => {
    const words = queryWords(q);
    return indexed.filter((i) => matchesWords(i.text, words)).map((i) => i.p);
  }, [indexed, q]);
  // Chip counts follow the search, so an empty category is visible before it is opened.
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: found.length };
    for (const p of found) c[p.c] = (c[p.c] ?? 0) + 1;
    return c;
  }, [found]);
  const inCat = useMemo(() => found.filter((p) => cat === "all" || p.c === cat), [found, cat]);
  const brands = useMemo(() => [...new Set(inCat.map(brandOf).filter(Boolean))].sort(), [inCat]);
  const activeBrand = brands.includes(brand) ? brand : "";
  const list = useMemo(() => (activeBrand ? inCat.filter((p) => brandOf(p) === activeBrand) : inCat), [inCat, activeBrand]);
  const brandCount = useMemo(() => new Set(PRODUCTS.map(brandOf).filter(Boolean)).size, [PRODUCTS]);
  const filtered = !!q.trim() || cat !== "all" || !!activeBrand;
  const resetFilters = () => { setQ(""); setCat("all"); setBrand(""); setShown(24); };

  const add = (id: string, d = 1) =>
    setCart((c) => {
      if (!byId[id] || (!c[id] && Object.keys(c).length >= 100)) return c;
      const n = { ...c, [id]: Math.min(999, (c[id] || 0) + d) };
      if ((n[id] ?? 0) <= 0) delete n[id];
      return n;
    });
  const addFromCatalog = (id: string, source: "featured" | "catalog" | "assistant" | "details", delta = 1) => {
    add(id, delta);
    if (delta > 0) window.__lovableEvents?.track?.("project.product_added_to_cart", { product_id: id, category: byId[id]?.c ?? "", source });
  };
  const viewed = viewId ? byId[viewId] : undefined;
  const card = (p: Product, source: "featured" | "catalog") => (
    <ProductCard key={p.id} p={p} feat={source === "featured"} qty={cart[p.id] ?? 0} onAdd={(d) => addFromCatalog(p.id, source, d)} onOpen={() => setViewId(p.id)} />
  );
  const ids = Object.keys(cart).filter((k) => byId[k]);
  const count = ids.reduce((s, k) => s + (cart[k] ?? 0), 0);

  return (
    <div className="min-h-screen">
      <div className="bg-ink px-5 py-2 text-center text-xs text-ink-foreground">معدات مختارة بعناية، ومعلومات واضحة لكل موديل <span className="mx-2 opacity-40">|</span> <a href={`tel:${CONTACT.phone}`} dir="ltr" className="font-display font-bold hover:text-accent">{CONTACT.phone}</a></div>
      <SiteHeader
        right={
          <Button onClick={() => setOpen(true)} aria-label={`السلة، ${nf(count)} قطعة`} className="ms-auto flex h-11 items-center gap-2 px-4 font-semibold md:ms-0">
            <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">السلة</span>
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
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#products" className="inline-flex h-12 items-center rounded-md bg-accent px-6 font-semibold text-accent-foreground transition hover:brightness-95">اكتشف المنتجات ←</a>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-md border border-ink-foreground/30 px-6 font-semibold transition hover:bg-ink-foreground/10"><MessageCircle className="h-4 w-4" />استشارة على واتساب</a>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {([[PRODUCTS.length, "صنف في الكتالوج"], [catalog.categories.length, "أقسام رئيسية"], [brandCount, "ماركة معروفة"]] as const).map(([n, l]) => (
                <div key={l}><dt className="text-sm opacity-70">{l}</dt><dd className="font-display text-3xl font-extrabold text-accent">{nf(n)}</dd></div>
              ))}
            </dl>
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
          {featured.map((p) => card(p, "featured"))}
        </div>
      </section>

      {/* Catalog */}
      <section id="products" className="scroll-mt-24 border-y border-border bg-muted/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-semibold text-primary">الكتالوج الكامل</p><h2 className="text-3xl font-bold">كل المنتجات</h2></div>
            <span className="text-sm text-muted-foreground" aria-live="polite">{nf(list.length)} صنف{filtered && <> · <button type="button" onClick={resetFilters} className="cursor-pointer font-semibold text-primary hover:underline">مسح الفلاتر</button></>}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(24); }} placeholder="ابحث بالاسم أو الماركة أو رقم الموديل" aria-label="ابحث في المنتجات" className="h-11 w-full rounded-md border border-input bg-card ps-10 pe-10 focus:outline-none focus:ring-2 focus:ring-ring [&::-webkit-search-cancel-button]:hidden" />
              {q && <button type="button" onClick={() => { setQ(""); setShown(24); }} aria-label="مسح البحث" className="absolute end-2 top-2 grid h-7 w-7 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>}
            </div>
            {brands.length > 1 && (
              <select value={activeBrand} onChange={(e) => { setBrand(e.target.value); setShown(24); }} aria-label="فلترة بالماركة" className="h-11 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">كل الماركات</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
          </div>
          <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {CATS.map(({ key: k, label: l }) => (
              <Button key={k} variant={cat === k ? "default" : "outline"} aria-pressed={cat === k} onClick={() => { setCat(k); setShown(24); }} className="h-auto shrink-0 gap-2 rounded-full px-4 py-1.5 text-sm">
                {l}<span className={`rounded-full px-1.5 text-xs ${cat === k ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"}`}>{nf(counts[k] ?? 0)}</span>
              </Button>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.slice(0, shown).map((p) => card(p, "catalog"))}
          </div>
          {!list.length && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">لا توجد نتائج مطابقة. جرّب اسماً أو رقم موديل آخر.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={resetFilters}>عرض كل المنتجات</Button>
                <Button asChild><a href={q.trim() ? `${WA_URL}?text=${encodeURIComponent(`أبحث عن: ${q.trim()}`)}` : WA_URL} target="_blank" rel="noopener noreferrer"><MessageCircle />اسألنا عنه على واتساب</a></Button>
              </div>
            </div>
          )}
          {list.length > shown && <div className="mt-10 text-center"><Button variant="outline" onClick={() => setShown((s) => s + 24)} className="h-11 px-8 font-semibold text-primary">عرض المزيد ({nf(list.length - shown)} متبقي)</Button></div>}
        </div>
      </section>

      {/* How ordering works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-16">
        <p className="text-sm font-semibold text-primary">بدون تعقيد</p>
        <h2 className="mt-1 text-3xl font-bold">طريقة الطلب في ٣ خطوات</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {HOW_STEPS.map(([I, t, d], i) => (
            <li key={t} className="relative rounded-lg border border-border bg-card p-6 shadow-card">
              <span aria-hidden className="absolute end-5 top-4 font-display text-4xl font-extrabold text-muted">{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-md bg-secondary text-primary"><I className="h-5 w-5" /></span>
              <h3 className="mt-4 text-xl font-bold">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
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
      <footer id="contact" className="scroll-mt-24 bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-2">
          <div><Logo light /><p className="mt-4 text-sm opacity-70">توافر المنتجات والكميات حسب آخر جرد للمخزن وقد يتغير دون إشعار؛ تُرسل الأسعار في عرض السعر.</p></div>
          <div>
            <h2 className="text-2xl font-bold">تواصل معنا</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 font-semibold text-accent-foreground"><MessageCircle className="h-4 w-4" />واتساب</a>
              <a href={`tel:${CONTACT.phone}`} className="inline-flex h-11 items-center gap-2 rounded-md border border-ink-foreground/30 px-4"><Phone className="h-4 w-4" /><span dir="ltr">{CONTACT.phone}</span></a>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex h-11 items-center gap-2 rounded-md border border-ink-foreground/30 px-4"><Mail className="h-4 w-4" />{CONTACT.email}</a>
            </div>
          </div>
        </div>
        <div className="border-t border-ink-foreground/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 pb-24 text-xs opacity-70 sm:pb-5">
            <span>© {new Date().getFullYear()} لايت كرنت هاوس. جميع الحقوق محفوظة.</span>
            <Link to="/company-quotes" className="hover:text-accent">دخول موظفي الشركة</Link>
          </div>
        </div>
      </footer>

      <a href={WA_URL} target="_blank" rel="noopener noreferrer" aria-label="تواصل معنا على واتساب" className="fixed bottom-5 end-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg transition hover:scale-105"><MessageCircle className="h-6 w-6" /></a>

      <ProductDialog p={viewed} categoryLabel={catalog.categories.find((c) => c.key === viewed?.c)?.label} qty={viewed ? cart[viewed.id] ?? 0 : 0} onAdd={(d) => viewed && addFromCatalog(viewed.id, "details", d)} onClose={() => setViewId(null)} onViewCart={() => { setViewId(null); setOpen(true); }} />
      <QuoteCart open={open} onOpenChange={setOpen} cart={cart} onAdd={add} products={PRODUCTS} />
      <ChatWidget onAdd={(id) => addFromCatalog(id, "assistant")} />
    </div>
  );
}
