import { Link } from "@tanstack/react-router";
import icon from "@/assets/logo-icon.png";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-md bg-card p-1">
        <img src={icon} alt="" width={1024} height={1024} className="h-full w-full object-contain" />
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
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
        <Logo />
        <nav className="ms-auto hidden gap-6 text-sm font-medium md:flex">
          <Link to="/" hash="products" className="hover:text-primary">المنتجات</Link>
          <Link to="/" hash="about" className="hover:text-primary">من نحن</Link>
          <Link to="/brand" className="hover:text-primary" activeProps={{ className: "text-primary" }}>الهوية البصرية</Link>
        </nav>
        {right}
      </div>
    </header>
  );
}
