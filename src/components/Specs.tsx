import {specs} from '../content';
import {useReveals} from '../hooks/useReveals';
import {useStops} from '../hooks/useStops';

/**
 * The claims, side by side. Each row draws two bars — Bliss in gold, a
 * typical eau de toilette in smoke — when it scrolls into view; the fact
 * strip underneath is the label on the back of the box.
 */
export function Specs() {
  const ref = useReveals<HTMLElement>();
  useStops(ref);
  return (
    <section ref={ref} id="specs" aria-labelledby="specs-title" className="relative bg-night px-4 pt-28 pb-8 sm:px-6 md:px-[6vw] md:pt-40 md:pb-12">
      <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-20">
        <div data-reveal>
          <p className="font-mono text-label text-gold uppercase">{specs.eyebrow}</p>
          <h2 id="specs-title" className="mt-3 font-display text-display text-ivory">
            {specs.heading}
          </h2>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-label uppercase">
            <span className="flex items-center gap-2 text-ivory/80">
              <span aria-hidden="true" className="h-1 w-5 rounded-full bg-gold" /> Bliss
            </span>
            <span className="flex items-center gap-2 text-ivory/50">
              <span aria-hidden="true" className="h-1 w-5 rounded-full bg-smoke/50" /> Typical eau de toilette
            </span>
          </div>
        </div>

        <dl className="space-y-10">
          {specs.rows.map((row, i) => (
            <div key={row.label} data-reveal style={{transitionDelay: `${i * 120}ms`}} className="group">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="font-mono text-label text-ivory/60 uppercase">{row.label}</dt>
                <dd className="font-display text-[2.5rem] leading-none text-gold-2 md:text-[3.25rem]">
                  {row.bliss}
                  <span className="text-[0.5em] text-ivory/70">{row.unit}</span>
                </dd>
              </div>
              <div className="mt-4 space-y-2" aria-hidden="true">
                <span className="block h-1.5 overflow-hidden rounded-full bg-white/5">
                  <span
                    className="block h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#b8741f] to-gold-2 transition-transform delay-300 duration-[1.4s] ease-[cubic-bezier(0.2,0.7,0.1,1)] group-[.is-in]:scale-x-100"
                    style={{width: `${(row.bliss / row.max) * 100}%`}}
                  />
                </span>
                <span className="block h-1.5 overflow-hidden rounded-full bg-white/5">
                  <span
                    className="block h-full origin-left scale-x-0 rounded-full bg-smoke/50 transition-transform delay-500 duration-[1.4s] ease-[cubic-bezier(0.2,0.7,0.1,1)] group-[.is-in]:scale-x-100"
                    style={{width: `${(row.typical / row.max) * 100}%`}}
                  />
                </span>
              </div>
              <p className="mt-2 text-right font-mono text-[0.625rem] tracking-[0.14em] text-ivory/45 uppercase">Typical: {row.typicalLabel}</p>
            </div>
          ))}
        </dl>
      </div>

      <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-gold/15 ring-1 ring-gold/15 sm:grid-cols-3 lg:grid-cols-6" data-reveal>
        {specs.facts.map(([k, v]) => (
          <div key={k} className="bg-night p-5 md:p-6">
            <dt className="font-mono text-label text-ivory/50 uppercase">{k}</dt>
            <dd className="mt-2 font-display text-[1.375rem] leading-tight text-ivory">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-mono text-[0.625rem] tracking-[0.14em] text-ivory/40 uppercase">{specs.note}</p>
    </section>
  );
}
