import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askAssistant, type ChatMessage } from "@/lib/chat.functions";
import { AVAILABILITY_LABELS, type Product } from "@/lib/brand";
import { productImage } from "@/lib/product-images";

type Turn = ChatMessage & { products?: Product[] };
const GREETING = "أهلاً بيك في لايت كرنت هاوس! أنا المساعد الذكي. قولّي محتاج إيه وأنا أرشحلك المنتجات المناسبة.";
const SUGGESTIONS = ["عايز كاميرات لمحل صغير", "إيه الفرق بين كاميرا IP والعادية؟", "إزاي أطلب عرض سعر؟"];

export function ChatWidget({ onAdd }: { onAdd: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const ask = useServerFn(askAssistant);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [turns, busy, open]);

  async function send(content: string) {
    const message = content.trim().slice(0, 1000);
    if (!message || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(next); setText(""); setBusy(true);
    window.__lovableEvents?.track?.("project.assistant_message_sent", { turn: next.filter((t) => t.role === "user").length });
    try {
      // Keep the request small: only the latest turns go to the server.
      const history = next.slice(-12).map(({ role, content: c }) => ({ role, content: c.slice(0, 2000) }));
      while (history[0]?.role !== "user") history.shift();
      const res = await ask({ data: { messages: history } });
      setTurns((t) => [...t, { role: "assistant", content: res.reply, products: res.products }]);
    } catch {
      setTurns((t) => [...t, { role: "assistant", content: "حصلت مشكلة في الاتصال. جرب تاني بعد شوية." }]);
    } finally { setBusy(false); }
  }
  const submit = (e: FormEvent) => { e.preventDefault(); void send(text); };
  const addProduct = (id: string) => { onAdd(id); setAdded((a) => ({ ...a, [id]: true })); };

  if (!open) return <button type="button" onClick={() => setOpen(true)} aria-label="افتح المساعد الذكي" className="fixed bottom-5 start-5 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-lg transition hover:scale-105"><Bot className="h-5 w-5" />اسأل المساعد</button>;

  return <section dir="rtl" aria-label="المساعد الذكي" className="fixed inset-x-3 bottom-3 z-40 flex max-h-[80vh] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:start-5 sm:bottom-5 sm:w-96">
    <header className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-ink-foreground">
      <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-accent" /><div><b className="block text-sm">مساعد لايت كرنت هاوس</b><small className="opacity-70">يرشحلك المنتجات ويساعدك تطلب عرض سعر</small></div></div>
      <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق المساعد" className="rounded p-1 hover:bg-ink-foreground/10"><X className="h-5 w-5" /></button>
    </header>
    <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
      <Bubble role="assistant">{GREETING}</Bubble>
      {!turns.length && <div className="flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => void send(s)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">{s}</button>)}</div>}
      {turns.map((t, i) => <div key={i} className="space-y-2">
        <Bubble role={t.role}>{t.content}</Bubble>
        {t.products?.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2">
          <img src={productImage(p)} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded object-contain" />
          <div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-semibold">{p.n}</p><small className={p.a === "in" ? "text-primary" : "text-destructive"}>● {AVAILABILITY_LABELS[p.a]}</small></div>
          <Button size="sm" variant={added[p.id] ? "secondary" : "default"} onClick={() => addProduct(p.id)} aria-label={`أضف ${p.n} للسلة`}><Plus />{added[p.id] ? "اتضاف" : "للسلة"}</Button>
        </div>)}
      </div>)}
      {busy && <Bubble role="assistant"><Loader2 className="inline h-4 w-4 animate-spin" /> بيكتب…</Bubble>}
      <div ref={endRef} />
    </div>
    <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="اكتب سؤالك…" aria-label="رسالتك للمساعد" disabled={busy} className="h-10 min-w-0 flex-1 rounded-md border border-input bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring" />
      <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label="إرسال"><Send /></Button>
    </form>
    <p className="px-3 pb-2 text-[10px] text-muted-foreground">ردود المساعد آلية وقد تحتوي على أخطاء؛ تأكد من التفاصيل مع الشركة.</p>
  </section>;
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 ${role === "user" ? "ms-auto bg-primary text-primary-foreground" : "bg-muted"}`}>{children}</div>;
}
