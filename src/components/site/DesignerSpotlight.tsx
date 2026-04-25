import { designers } from "@/data/mock";

export function DesignerSpotlight() {
  return (
    <section id="designers" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Spotlight</p>
          <h2 className="mt-3 font-display text-4xl font-light sm:text-5xl">
            Meet the makers
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {designers.map((d) => (
          <article
            key={d.name}
            className="group relative overflow-hidden rounded-2xl border border-border"
          >
            <div className="relative aspect-[4/5]">
              <img
                src={d.avatar}
                alt={d.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">{d.school}</p>
              <h3 className="mt-1 font-display text-2xl">{d.name}</h3>
              <p className="mt-2 max-w-[28ch] text-sm text-white/85">{d.tagline}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
