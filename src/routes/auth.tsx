import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Logo } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { COMPANY_EMAIL, isCompanyEmail } from "@/lib/company-access";
import "@lovable.dev/cloud-auth-js/styles.css";
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "دخول الشركة | لايت كرنت هاوس" }, { name: "description", content: "دخول الشركة لمتابعة طلبات عروض السعر." }, { property: "og:title", content: "دخول الشركة | لايت كرنت هاوس" }, { property: "og:description", content: "دخول آمن لمتابعة طلبات العملاء." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: CompanyLogin,
});
function CompanyLogin() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState(COMPANY_EMAIL);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void navigate({ to: "/company-quotes", replace: true });
    });
    return () => { active = false; };
  }, [navigate]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage("");
    const login = email.trim().toLowerCase() === "admin" ? "admin@lchouse.app" : email;
    const parsed = z.string().trim().email().max(255).safeParse(login);
    if (!parsed.success) { setMessage("اكتب بريدًا إلكترونيًا صحيحًا"); return; }
    if (mode === "signup" && !isCompanyEmail(email)) { setMessage("إنشاء حساب الإدارة متاح لبريد الشركة فقط"); return; }
    if (mode !== "reset" && !z.string().min(8).max(128).safeParse(password).success) { setMessage("كلمة المرور ٨ أحرف على الأقل"); return; }
    setBusy(true);
    try {
      if (mode === "reset") {
        const result = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${window.location.origin}/reset-password` });
        setMessage(result.error ? "تعذر إرسال رابط الاستعادة؛ حاول لاحقًا" : "لو البريد مسجل، هيوصلك رابط لتعيين كلمة مرور جديدة.");
      } else if (mode === "signup") {
        const result = await supabase.auth.signUp({ email: parsed.data, password, options: { emailRedirectTo: `${window.location.origin}/company-quotes` } });
        if (result.error) setMessage("تعذر إنشاء الحساب؛ جرّب دخول Google أو حاول لاحقًا");
        else if (result.data.session) await navigate({ to: "/company-quotes" });
        else setMessage("راجع بريد الشركة واضغط رابط التأكيد، ثم سجّل الدخول.");
      } else {
        const result = await supabase.auth.signInWithPassword({ email: parsed.data, password });
        if (result.error) setMessage("راجع البريد وكلمة المرور وتأكيد البريد");
        else await navigate({ to: "/company-quotes" });
      }
    } catch { setMessage("تعذر الاتصال؛ حاول مرة أخرى"); } finally { setBusy(false); }
  }
  async function social(provider: "google" | "lovable") {
    setBusy(true); setMessage("");
    try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setMessage("تعذر تسجيل الدخول");
      else if (!result.redirected) await navigate({ to: "/company-quotes" });
    } catch { setMessage("تعذر تسجيل الدخول"); } finally { setBusy(false); }
  }
  return <main className="mx-auto min-h-screen max-w-md px-5 py-12"><Logo /><h1 className="mt-12 text-3xl font-bold">دخول الشركة</h1><p className="mt-3 text-sm text-muted-foreground">طلبات عروض السعر متاحة لحساب الشركة المعتمد فقط.</p><form onSubmit={submit} className="mt-7 space-y-4"><div><label htmlFor="company-email" className="block text-sm">البريد الإلكتروني</label><input id="company-email" type="email" autoComplete="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3" dir="ltr" /></div>{mode !== "reset" && <div><label htmlFor="company-password" className="block text-sm">كلمة المرور</label><input id="company-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3" /></div>}<Button disabled={busy} className="h-11 w-full">{mode === "signup" ? "إنشاء حساب الشركة" : mode === "reset" ? "إرسال رابط الاستعادة" : "دخول"}</Button></form><p role="status" className="mt-4 text-sm text-primary">{message}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="link" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}>{mode === "signup" ? "لدي حساب" : "إنشاء حساب الشركة"}</Button><Button variant="link" onClick={() => { setMode(mode === "reset" ? "login" : "reset"); setMessage(""); }}>{mode === "reset" ? "العودة للدخول" : "نسيت كلمة المرور؟"}</Button></div><div className="mt-6 space-y-3 border-t border-border pt-6"><Button variant="outline" disabled={busy} onClick={() => social("google")} className="h-11 w-full">الدخول بحساب Google</Button><button type="button" disabled={busy} onClick={() => social("lovable")} className="lovable-auth-button">Continue with Lovable</button><Button variant="ghost" onClick={() => navigate({ to: "/company-quotes" })} className="w-full">متابعة إلى طلبات الشركة</Button></div></main>;
}