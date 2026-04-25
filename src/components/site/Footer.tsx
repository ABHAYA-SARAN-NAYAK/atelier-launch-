import logo from "@/assets/logo-atelier.jpg";

const cols = [
  {
    title: "Shop",
    links: ["New drops", "Womenswear", "Menswear", "Accessories", "Gift cards"],
  },
  {
    title: "Atelier",
    links: ["For designers", "Schools", "Sustainability", "Press", "Journal"],
  },
  {
    title: "Support",
    links: ["Help center", "Shipping", "Returns", "Sizing", "Contact"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 sm:grid-cols-4 lg:px-10">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Atelier Launch" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-display text-lg">Atelier Launch</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Limited-edition fashion drops from emerging student designers.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-foreground/80 hover:text-foreground">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center lg:px-10">
          <p>© {new Date().getFullYear()} Atelier Launch. Made with care.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
