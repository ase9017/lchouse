import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileText, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export function AdminNav({ current }: { current: "quotes" | "products" }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); }
  return <header className="border-b border-border"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5"><Logo /><nav className="flex flex-wrap gap-2">
    <Button asChild variant="outline"><Link to="/"><ArrowRight />رجوع للموقع</Link></Button>
    <Button asChild variant={current === "quotes" ? "secondary" : "ghost"}><Link to="/company-quotes"><FileText />طلبات عروض السعر</Link></Button>
    <Button asChild variant={current === "products" ? "secondary" : "ghost"}><Link to="/admin-products"><Package />المنتجات</Link></Button>
    <Button variant="outline" onClick={signOut}><LogOut />خروج</Button>
  </nav></div></header>;
}
