import {wear} from '../content';
import {useReveals} from '../hooks/useReveals';
import {useStops} from '../hooks/useStops';

/** Four occasions, from the product listing's "Where to wear it". */
export function Wear() {
  const ref = useReveals<HTMLElement>();
  useStops(ref);
  return (
    <section ref={ref} id="wear" aria-labelledby="wear-title" className="relative bg-night px-4 py-28 sm:px-6 md:px-[6vw] md:py-40">
      <div className="max-w-[44rem]" data-reveal>
        <p className="font-mono text-label text-gold uppercase">{wear.eyebrow}</p>
        <h2 id="wear-title" className="mt-3 font-display text-display text-ivory">
          {wear.heading}
        </h2>
      </div>

      <ol className="mt-14 grid gap-px overflow-hidden rounded-[8px] bg-gold/15 ring-1 ring-gold/15 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
        {wear.items.map((w, i) => (
          <li key={w.name} data-reveal style={{transitionDelay: `${i * 100}ms`}} className="group bg-night p-7 transition-colors duration-500 hover:bg-night-2 md:p-9">
            <span className="font-mono text-label text-gold">0{i + 1}</span>
            <h3 className="mt-10 font-display text-[2.25rem] leading-none text-ivory italic transition-colors group-hover:text-gold-2">{w.name}</h3>
            <p className="mt-4 text-body text-ivory/65">{w.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
