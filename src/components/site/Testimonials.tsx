const quotes = [
  {
    body: "I get compliments every time I wear my Atelier piece. It's wild knowing only six exist.",
    name: "Sasha L.",
    role: "Buyer · Brooklyn",
  },
  {
    body: "Atelier Launch sold out my graduate collection in 18 hours. It funded my first studio.",
    name: "Theo Laurent",
    role: "Designer · Parsons '25",
  },
  {
    body: "The closest thing to couture for people who actually live in their clothes.",
    name: "Vogue Business",
    role: "Editorial",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-gold">In their words</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-center font-display text-4xl font-light sm:text-5xl text-balance">
          Loved by collectors and the next generation of design.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-soft"
            >
              <span className="font-display text-5xl leading-none text-gold">"</span>
              <blockquote className="mt-2 text-pretty text-lg leading-relaxed">
                {q.body}
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-medium">{q.name}</div>
                <div className="text-muted-foreground">{q.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
