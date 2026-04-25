const steps = [
  {
    n: "01",
    title: "Discover",
    body: "Browse weekly drops from emerging ateliers across the world's top fashion schools.",
  },
  {
    n: "02",
    title: "Support",
    body: "Pre-order within 72 hours. Your order funds the maker directly — never overproduced.",
  },
  {
    n: "03",
    title: "Wear",
    body: "Receive your numbered piece, handmade and signed by the designer behind it.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">The Atelier model</p>
            <h2 className="mt-3 font-display text-4xl font-light sm:text-5xl text-balance">
              A new way to wear something <em className="italic">no one else has</em>.
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              Every piece is made-to-order in tiny runs. No deadstock, no factories,
              no compromise — just the next generation of fashion, direct from the studio.
            </p>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <li
                key={s.n}
                className="group rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft"
              >
                <span className="font-display text-3xl text-gold">{s.n}</span>
                <h3 className="mt-6 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
