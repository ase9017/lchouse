import { Link } from "@tanstack/react-router";
import icon from "@/assets/logo-icon.png";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-11 place-items-center rounded-md bg-card px-2.5">
        <img src={icon} alt="" className="h-7 w-auto" />

      </span>
      <span className="leading-tight">
        <b className={`block text-lg ${light ? "text-ink-foreground" : "text-foreground"}`}>لايت كرنت هاوس</b>
        <small dir="ltr" className="block font-display text-[9px] font-bold tracking-[0.2em] text-muted-foreground">
          LIGHT CURRENT HOUSE
        </small>
      </span>
    </Link>
  );
}

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3 md:gap-6">
        <Logo />
        <nav className="order-3 flex w-full gap-5 text-sm font-medium md:order-none md:ms-auto md:w-auto md:gap-6">
          <Link to="/" hash="products" className="hover:text-primary">المنتجات</Link>
          <Link to="/" hash="about" className="hover:text-primary">من نحن</Link>
          <Link to="/company-quotes" className="hover:text-primary">طلبات الشركة</Link>
        </nav>
        {right}
      </div>
    </header>
  );
}
