import { ArrowRight, Sparkles } from "lucide-react";
import hero from "@/assets/hero-atelier.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--gold)_18%,transparent)_0%,_transparent_60%)]" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-12 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-32 lg:pt-20">
        <div className="lg:col-span-6 reveal-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            New season · 14 ateliers live now
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-light leading-[0.95] text-balance">
            Wear tomorrow's <em className="italic text-gold">fashion</em> today.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Limited-edition pieces from the world's most promising fashion students.
            72-hour drops. 5 to 20 pieces. Made by hand, never repeated.
          </p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#collections"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:translate-y-[-1px] hover:shadow-editorial"
            >
              Explore Collections
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#designer-cta"
              className="inline-flex h-12 items-center justify-center rounded-full border border-foreground/20 bg-background/40 px-7 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
            >
              I'm a Designer
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border/60 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Ateliers</dt>
              <dd className="mt-1 font-display text-2xl">240+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Schools</dt>
              <dd className="mt-1 font-display text-2xl">38</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Pieces sold</dt>
              <dd className="mt-1 font-display text-2xl">12k</dd>
            </div>
          </dl>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 shadow-editorial">
            <img
              src={hero}
              alt="A sunlit fashion atelier with floating fabric swatches, thread spools, and a designer dashboard"
              className="h-[520px] w-full object-cover sm:h-[620px]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/30 via-transparent to-transparent" />
          </div>

          {/* Floating drop card */}
          <div className="absolute -bottom-6 left-6 hidden w-[280px] rounded-2xl border border-border bg-card/95 p-4 shadow-editorial backdrop-blur sm:block">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Live drop</span>
              <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[11px] font-medium text-coral">02d 14h</span>
            </div>
            <p className="mt-2 font-display text-lg leading-tight">Liminal — by Mira Okonkwo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Central Saint Martins · 8 pieces left</p>
          </div>

          <div className="absolute -right-3 top-8 hidden rounded-full bg-gradient-gold px-4 py-2 text-xs font-medium text-gold-foreground shadow-soft sm:block">
            ✦ 5–20 pieces only
          </div>
        </div>
      </div>
    </section>
  );
}
