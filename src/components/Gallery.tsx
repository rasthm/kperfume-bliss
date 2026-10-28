import {useEffect, useRef} from 'react';
import {gallery} from '../content';
import {clamp, pinProgress, range} from '../lib/math';
import {addStops, onFrame} from '../lib/scroll';

/**
 * Six chapters on the product, as a reel. The section pins and the reel
 * slides sideways with the scroll; the chapter nearest the focus line is
 * lit, the rest dim back, and each picture drifts against its frame.
 */

const SECTION_VH = 380;
/** The span of the pin over which the reel travels. */
const WINDOW = [0.04, 0.96] as const;

/** Focus line: right of centre beside the desktop heading, centred on phones. */
const focusX = (vw: number) => vw * (vw >= 768 ? 0.6 : 0.5);
/** How far the reel can travel before its last card meets the right edge. */
const travelOf = (track: HTMLElement, vw: number) => Math.max(0, track.offsetLeft + track.scrollWidth - vw * 0.94);

export function Gallery() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Soft stops, one per card: the scroll position at which that card's
  // centre sits on the focus line, measured from the untransformed layout
  // so it holds at every viewport. One flick moves one card.
  useEffect(
    () =>
      addStops(() => {
        const root = rootRef.current;
        const track = trackRef.current;
        if (!root || !track) return [];
        const vw = window.innerWidth;
        const top = root.getBoundingClientRect().top + window.scrollY;
        const span = Math.max(0, root.offsetHeight - window.innerHeight);
        const travel = travelOf(track, vw);
        const at = cardRefs.current.map((card, i) => {
          if (i === 0 || travel === 0) return top;
          const k = clamp((track.offsetLeft + card.offsetLeft + card.offsetWidth / 2 - focusX(vw)) / travel);
          return top + (WINDOW[0] + k * (WINDOW[1] - WINDOW[0])) * span;
        });
        // The first card never reaches the focus line and the last ones pile
        // up at the end of the travel, so neighbouring stops can nearly
        // coincide — merge any closer than a third of a screen, or a flick
        // would land on what looks like the same card twice.
        const gap = window.innerHeight / 3;
        const kept: number[] = [];
        for (const s of at) if (!kept.length || s - kept[kept.length - 1] > gap) kept.push(s);
        return kept;
      }, {stepped: true}),
    [],
  );

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const k = range(p, ...WINDOW);
      // offsetLeft is the untransformed layout position, so this is stable
      // while the track itself is being translated.
      const travel = travelOf(track, vw);
      track.style.transform = `translate3d(${-k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cardRefs.current.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - focusX(vw)) / vw;
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.6);
        card.style.transform = `scale(${1 - a * 0.06})`;
        imgRefs.current[i].style.transform = `translate3d(${off * -50}px, 0, 0) scale(1.12)`;
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      countRef.current!.textContent = String(nearest + 1).padStart(2, '0');
      barRef.current!.style.transform = `scaleX(${k})`;
    });
  }, []);

  return (
    <section ref={rootRef} id="gallery" aria-labelledby="gallery-title" className="relative bg-night" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col justify-center overflow-hidden pt-16 md:flex-row md:items-center md:justify-start md:pt-0">
        {/* The reel slides under the heading, which keeps a dark backing. */}
        <div className="relative z-10 shrink-0 px-4 sm:px-6 md:flex md:h-full md:w-[34vw] md:flex-col md:justify-center md:bg-gradient-to-r md:from-night md:from-75% md:to-transparent md:pr-14 md:pl-[6vw]">
          <p className="font-mono text-label text-gold uppercase">{gallery.eyebrow}</p>
          <h2 id="gallery-title" className="mt-3 font-display text-display text-ivory">
            {gallery.heading}
          </h2>
          <p className="mt-5 max-w-[24rem] text-body text-ivory/65 max-md:hidden">{gallery.intro}</p>
          <div className="mt-8 flex items-center gap-4 font-mono text-label text-ivory/60 uppercase max-md:hidden" aria-hidden="true">
            <span>
              <span ref={countRef} className="text-ivory">
                01
              </span>{' '}
              / {String(gallery.items.length).padStart(2, '0')}
            </span>
            <span className="relative h-px w-28 bg-white/15">
              <span ref={barRef} className="absolute inset-0 origin-left bg-gold" style={{transform: 'scaleX(0)'}} />
            </span>
          </div>
        </div>

        <ol ref={trackRef} className="mt-6 flex gap-5 pl-4 will-change-transform sm:pl-6 md:mt-0 md:gap-8 md:pl-0">
          {gallery.items.map((item, i) => (
            <li
              key={item.title}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              // On phones the card is sized by height too, so a short screen
              // never pushes the caption out of the pinned frame.
              className="w-[min(70vw,36svh)] shrink-0 origin-bottom sm:w-[min(40vw,40svh)] md:w-[clamp(15rem,21vw,21rem)]"
            >
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-night-2 ring-1 ring-gold/15">
                  <img
                    ref={(el) => {
                      if (el) imgRefs.current[i] = el;
                    }}
                    src={item.image}
                    alt={item.alt}
                    width={576}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover will-change-transform"
                  />
                  <span className="absolute top-3 left-3 rounded-[3px] bg-night/70 px-2 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-gold-2 uppercase backdrop-blur">
                    0{i + 1}
                  </span>
                </div>
                <figcaption className="mt-4">
                  <span className="block font-display text-[1.5rem] leading-tight text-ivory">{item.title}</span>
                  <span className="mt-1 block font-mono text-label text-gold uppercase">{item.lead}</span>
                  <span className="mt-2.5 block text-[0.875rem] leading-relaxed text-ivory/65">{item.body}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
