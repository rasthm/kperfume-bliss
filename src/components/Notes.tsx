import {useEffect, useRef} from 'react';
import {notes} from '../content';
import {useStops} from '../hooks/useStops';
import {clamp, easeOutCubic, lerp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * The pyramid, told in time. The section pins while the three tiers take
 * the stage one after another; the glow behind them shifts from currant
 * purple to rose red to amber, and the bottle sits in a window cut to the
 * shape of its own label.
 */

const SECTION_VH = 360;
/** The span of the pin over which the tiers hand over to each other. */
const WINDOW = [0.08, 0.92] as const;
/**
 * Soft stops, one per tier: the section's top (the first tier already
 * holds there), then the point where each later tier is fully on stage.
 * One flick moves one tier.
 */
const STOPS = notes.tiers.map((_, i) => (i === 0 ? 0 : WINDOW[0] + ((i + 0.5) / notes.tiers.length) * (WINDOW[1] - WINDOW[0])));

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const TINTS = notes.tiers.map((t) => hex(t.tint));

/** The label's pentagon arch, as a clip path. */
const ARCH = 'polygon(0% 22%, 50% 0%, 100% 22%, 100% 100%, 0% 100%)';

export function Notes() {
  const rootRef = useRef<HTMLElement>(null);
  const tierRefs = useRef<HTMLDivElement[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dropRef = useRef<HTMLSpanElement>(null);
  const stepRefs = useRef<HTMLSpanElement[]>([]);
  useStops(rootRef, STOPS, true);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      // u runs 0 → 3 across the three tiers.
      const u = range(p, ...WINDOW) * notes.tiers.length;
      // The first and last tiers hold at the section's ends instead of
      // fading out, so the stage is never empty.
      const held = clamp(u, 0.5, notes.tiers.length - 0.5);
      tierRefs.current.forEach((el, i) => {
        const d = held - i - 0.5; // 0 at the tier's centre
        const a = clamp(1 - Math.abs(d) * 2.2);
        el.style.opacity = String(easeOutCubic(a));
        el.style.transform = `translate3d(0, ${-d * 60}px, 0)`;
        el.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
        stepRefs.current[i].style.opacity = String(0.3 + 0.7 * clamp(u - i));
      });

      const t = clamp(u - 0.5, 0, notes.tiers.length - 1);
      const k = Math.floor(t);
      const f = t - k;
      const a = TINTS[k];
      const b = TINTS[Math.min(k + 1, TINTS.length - 1)];
      const c = a.map((v, i) => Math.round(lerp(v, b[i], f)));
      glowRef.current!.style.background = `radial-gradient(60% 60% at 70% 50%, rgb(${c.join(' ')} / 0.5), transparent 70%)`;

      archRef.current!.style.transform = `translate3d(0, ${lerp(6, -6, p)}vh, 0)`;
      imgRef.current!.style.transform = `scale(${lerp(1.25, 1.05, easeOutCubic(p))})`;
      dropRef.current!.style.transform = `scaleY(${range(p, ...WINDOW)})`;
    });
  }, []);

  return (
    <section ref={rootRef} id="notes" aria-labelledby="notes-title" className="relative bg-night" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 h-screen-s overflow-hidden">
        <div ref={glowRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />

        <div className="relative grid h-full grid-rows-[auto_1fr] px-4 pt-20 pb-8 sm:px-6 md:grid-cols-[1fr_auto] md:grid-rows-1 md:items-center md:gap-12 md:px-[6vw] md:pt-0 md:pb-0">
          <div className="relative md:h-[60vh]">
            <p className="font-mono text-label text-gold uppercase">{notes.eyebrow}</p>
            <h2 id="notes-title" className="mt-3 font-display text-display text-ivory">
              {notes.heading}
            </h2>

            <div className="mt-6 flex items-center gap-3 font-mono text-label text-ivory uppercase" aria-hidden="true">
              {notes.tiers.map((t, i) => (
                <span
                  key={t.tier}
                  ref={(el) => {
                    if (el) stepRefs.current[i] = el;
                  }}
                  className="flex items-center gap-3"
                  style={{opacity: 0.3}}
                >
                  {i > 0 && <span className="h-px w-6 bg-ivory/40" />}
                  {t.tier}
                </span>
              ))}
            </div>

            <div className="relative mt-6 min-h-[11rem] md:mt-12 md:min-h-[15rem]">
              {notes.tiers.map((t, i) => (
                <div
                  key={t.tier}
                  ref={(el) => {
                    if (el) tierRefs.current[i] = el;
                  }}
                  className="absolute inset-x-0 top-0"
                  style={{opacity: i === 0 ? 1 : 0}}
                >
                  <p className="font-mono text-label text-ivory/60 uppercase">
                    {t.tier} notes · {t.when}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] font-medium italic">
                    <span className="foil" style={{backgroundPosition: '30% 0'}}>
                      {t.names.join(' & ')}
                    </span>
                  </h3>
                  <p className="mt-5 max-w-[30rem] text-body text-ivory/75">{t.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto flex items-end gap-6 self-end md:self-center">
            <span aria-hidden="true" className="relative mb-2 h-[22svh] w-px bg-white/15 md:h-[52vh]">
              <span ref={dropRef} className="absolute inset-0 origin-top bg-gold" style={{transform: 'scaleY(0)'}} />
            </span>
            <div ref={archRef} className="h-[30svh] w-[21svh] overflow-hidden md:h-[64vh] md:w-[44vh]" style={{clipPath: ARCH}}>
              <img ref={imgRef} src="/media/bliss-hero.webp" alt="The Bliss bottle beside its box" className="size-full object-cover will-change-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
