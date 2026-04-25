import { ArrowRight } from "lucide-react";

export function DesignerCTA() {
  return (
    <section id="designer-cta" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-primary-foreground sm:px-14 sm:py-24">
        <div
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "color-mix(in oklab, var(--coral) 80%, transparent)" }}
          aria-hidden
        />

        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">For designers</p>
            <h2 className="mt-3 font-display text-4xl font-light leading-tight text-balance sm:text-5xl">
              Launch your label before you graduate.
            </h2>
            <p className="mt-5 max-w-xl text-primary-foreground/75">
              Upload a collection in minutes. Set your drop. Keep 85% of every sale.
              We handle payments, audience, and the spotlight.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#auth"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-sm font-medium text-gold-foreground transition-all hover:translate-y-[-1px]"
              >
                Apply as a Designer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how"
                className="text-sm text-primary-foreground/80 underline-offset-4 hover:underline"
              >
                Read the manifesto →
              </a>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-6 border-t border-white/15 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div>
              <dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Payout</dt>
              <dd className="mt-2 font-display text-3xl text-gold">85%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Setup</dt>
              <dd className="mt-2 font-display text-3xl">12 min</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Drop</dt>
              <dd className="mt-2 font-display text-3xl">72 hrs</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
