import { ArrowUpRight } from "lucide-react";
import { collections } from "@/data/mock";
import { Countdown } from "./Countdown";

export function CollectionsGrid() {
  return (
    <section id="collections" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Live drops</p>
          <h2 className="mt-3 font-display text-4xl font-light sm:text-5xl">
            Collections ending soon
          </h2>
        </div>
        <a
          href="#all"
          className="hidden items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground sm:inline-flex"
        >
          View all <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <article key={c.id} className="group cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium backdrop-blur">
                <Countdown endsAt={c.endsAt} />
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-coral/90 px-3 py-1 text-[11px] font-medium text-coral-foreground backdrop-blur">
                {c.piecesLeft} left
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl leading-tight">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.designer} · <span className="text-gold">{c.school}</span>
                </p>
              </div>
              <p className="whitespace-nowrap text-sm text-foreground/80">from ${c.priceFrom}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
