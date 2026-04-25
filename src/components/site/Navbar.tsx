import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo-atelier.jpg";

const nav = [
  { label: "Collections", href: "#collections" },
  { label: "Designers", href: "#designers" },
  { label: "How it Works", href: "#how" },
  { label: "Journal", href: "#journal" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Atelier Launch" className="h-9 w-9 rounded-md object-cover" />
          <span className="font-display text-lg tracking-tight">Atelier Launch</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            aria-label="Cart"
            className="relative rounded-full p-2 text-foreground transition-colors hover:bg-muted"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-medium text-coral-foreground">
              0
            </span>
          </button>
          <a
            href="#auth"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Sign in
          </a>
          <a
            href="#auth"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Join Atelier
          </a>
        </div>

        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col px-6 py-4">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm text-foreground"
              >
                {n.label}
              </a>
            ))}
            <a
              href="#auth"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Join Atelier
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
