import {brand, buy} from '../content';
import {useReveals} from '../hooks/useReveals';
import {useStops} from '../hooks/useStops';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** Two sizes, straight through to the real product page. */
export function Buy() {
  const ref = useReveals<HTMLElement>();
  useStops(ref);
  return (
    <section ref={ref} id="buy" aria-labelledby="buy-title" className="relative overflow-hidden bg-night px-4 pb-28 sm:px-6 md:px-[6vw] md:pb-40">
      {/* The amber of the liquid, glowing up from below — the hero, bookended. */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[60vw] left-1/2 size-[100vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(232,163,61,0.32),rgba(75,29,110,0.12)_50%,transparent_70%)]" />

      <div className="relative border-t border-gold/15 pt-20 md:pt-28">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="font-mono text-label text-gold uppercase">{buy.eyebrow}</p>
            <h2 id="buy-title" className="mt-3 font-display text-display text-ivory">
              {buy.heading}
            </h2>
          </div>
          <p className="font-mono text-label text-ivory/55 uppercase">{buy.combo}</p>
        </div>

        <ol className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-5">
          {buy.sizes.map((s, i) => (
            <li
              key={s.size}
              data-reveal
              style={{transitionDelay: `${i * 110}ms`}}
              className={`relative flex flex-col rounded-[8px] p-7 ring-1 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 md:p-10 ${
                s.featured ? 'bg-night-2 ring-gold/50 hover:shadow-[0_30px_80px_-30px_rgb(232_163_61/0.45)]' : 'bg-night-2/50 ring-white/10 hover:ring-white/25'
              }`}
            >
              {s.featured && <span className="self-start rounded-[3px] bg-gold px-2 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-night uppercase">Best value</span>}
              <h3 className={`font-display text-[3.5rem] leading-none text-ivory ${s.featured ? 'mt-5' : ''}`}>{s.size}</h3>
              <p className="mt-3 text-body text-ivory/65">{s.note}</p>
              <p className="mt-8 flex items-baseline gap-3 border-t border-white/10 pt-6">
                <span className="font-display text-[2.5rem] leading-none text-gold-2">{inr(s.price)}</span>
                <span className="text-body text-ivory/40 line-through">{inr(s.mrp)}</span>
                <span className="font-mono text-label text-gold uppercase">{Math.round((1 - s.price / s.mrp) * 100)}% off</span>
              </p>
              <a
                href={brand.shopUrl}
                target="_blank"
                rel="noreferrer"
                className={`mt-10 rounded-[4px] px-5 py-4 text-center font-mono text-label uppercase transition-colors ${
                  s.featured ? 'bg-gold text-night hover:bg-gold-2' : 'text-ivory ring-1 ring-white/25 hover:bg-ivory hover:text-night'
                }`}
              >
                Shop {s.size} on kperfume.in ↗
              </a>
            </li>
          ))}
        </ol>

        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 font-mono text-label text-ivory/60 uppercase" data-reveal>
          {buy.perks.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
