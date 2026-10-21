import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Globe } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import logo from "@/assets/logo.png";
import icon from "@/assets/logo-icon.png";
import { CONTACT } from "@/lib/brand";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "دليل الهوية البصرية | لايت كرنت هاوس" },
      { name: "description", content: "الشعار والألوان والخطوط وكروت العمل لشركة لايت كرنت هاوس." },
      { property: "og:title", content: "دليل الهوية البصرية | لايت كرنت هاوس" },
      { property: "og:description", content: "الشعار والألوان والخطوط وكروت العمل." },
    ],
  }),
  component: Brand,
});

const COLORS = [
  ["أخضر بترولي عميق", "#112E35", "bg-ink", "text-ink-foreground", "النصوص والخلفيات الداكنة"],
  ["أخضر بترولي", "#16494B", "bg-primary", "text-primary-foreground", "اللون الأساسي والأزرار"],
  ["ليموني التيار", "#D6E879", "bg-accent", "text-accent-foreground", "لمسة إبراز فقط"],
  ["ورقي دافئ", "#F5F3EC", "bg-background", "text-foreground", "الخلفية العامة"],
  ["رمادي مخضر", "#E5ECE5", "bg-secondary", "text-secondary-foreground", "الخلفيات الثانوية"],
];

function Section({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-14">
      <div className="mb-8 flex items-baseline gap-4"><span className="font-display text-sm font-bold text-primary">{n}</span><h2 className="text-3xl font-bold">{t}</h2></div>
      {children}
    </section>
  );
}

function Brand() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="bg-ink-gradient text-ink-foreground">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="font-display text-xs font-bold tracking-[0.3em] text-accent" dir="ltr">BRAND GUIDELINES</p>
          <h1 className="mt-4 text-5xl font-bold">دليل الهوية البصرية</h1>
          <p className="mt-4 max-w-xl opacity-80">قواعد استخدام شعار لايت كرنت هاوس وألوانه وخطوطه، لتظهر الشركة بصورة واحدة واضحة في كل مكان.</p>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-5">
        <Section n="01" t="الشعار">
          <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
            <div className="grid place-items-center rounded-lg border border-border bg-card p-8"><img src={logo} alt="شعار لايت كرنت هاوس" width={1536} height={768} className="w-full max-w-xl" /></div>
            <div className="grid place-items-center rounded-lg bg-ink p-8"><span className="rounded-lg bg-card p-4"><img src={icon} alt="أيقونة الشعار" width={1024} height={1024} className="h-32 w-32" /></span></div>
          </div>
          <ul className="mt-6 grid gap-3 text-muted-foreground md:grid-cols-3">
            <li>• البيت يرمز للأمان، والعدسة للمراقبة، والبرق الليموني للتيار الخفيف.</li>
            <li>• اترك مسافة حول الشعار تساوي عرض العدسة على الأقل.</li>
            <li>• لا تغيّر الألوان أو تمدّ الشعار أو تضعه على خلفية مزدحمة.</li>
          </ul>
        </Section>

        <Section n="02" t="الألوان">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {COLORS.map(([name, hex, bg, fg, use]) => (
              <div key={hex} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className={`h-32 ${bg} ${fg} p-4 font-display font-bold`} dir="ltr">{hex}</div>
                <div className="p-4"><b className="block">{name}</b><span className="text-sm text-muted-foreground">{use}</span></div>
              </div>
            ))}
          </div>
        </Section>

        <Section n="03" t="الخطوط">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-8">
              <p className="text-sm text-muted-foreground">الخط العربي · IBM Plex Sans Arabic</p>
              <p className="mt-4 text-5xl font-bold">أمان بلا شك</p>
              <p className="mt-3 text-lg">أ ب ت ث ج ح خ د ذ ر ز س ش ١٢٣٤٥</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-8 font-display" dir="ltr">
              <p className="text-sm text-muted-foreground">Latin · Manrope</p>
              <p className="mt-4 text-5xl font-extrabold">Secure. Clear.</p>
              <p className="mt-3 text-lg">DS-2CE16D0T · 0123456789</p>
            </div>
          </div>
        </Section>

        <Section n="04" t="كروت العمل">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Front */}
            <div className="relative aspect-[1.75] overflow-hidden rounded-xl bg-ink-gradient p-8 text-ink-foreground shadow-card">
              <div className="grid-lines absolute inset-0" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="w-fit rounded-lg bg-card p-2"><img src={icon} alt="" width={1024} height={1024} className="h-14 w-14" /></span>
                <div>
                  <b className="block text-3xl">لايت كرنت هاوس</b>
                  <span dir="ltr" className="block font-display text-xs font-bold tracking-[0.3em] text-accent">LIGHT CURRENT HOUSE</span>
                </div>
              </div>
            </div>
            {/* Back */}
            <div className="relative aspect-[1.75] overflow-hidden rounded-xl border border-border bg-card p-8 shadow-card">
              <div className="absolute inset-y-0 start-0 w-2 bg-accent" />
              <div className="flex h-full flex-col justify-between">
                <div><b className="block text-2xl">الاسم هنا</b><span className="text-primary">المسمى الوظيفي</span></div>
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span dir="ltr">{CONTACT.phone}</span></p>
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{CONTACT.email}</p>
                  <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />كاميرات المراقبة · الشبكات · التيار الخفيف</p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">المقاس القياسي ٨٫٥ × ٥ سم. الوجه الأمامي داكن، والخلفي فاتح ببيانات التواصل.</p>
        </Section>
      </main>
    </div>
  );
}
