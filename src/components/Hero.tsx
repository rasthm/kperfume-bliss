import {useEffect, useRef} from 'react';
import {hero} from '../content';
import {FALLBACK, FRAMES} from '../frames';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {clamp, easeOutCubic, lerp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * The hero is the film. Chained Gemini clips are cut to a frame sequence and
 * a pinned canvas draws the frame that matches the scroll:
 *
 *   0.00 – 0.12  a veil of gold smoke lifts off the lens
 *   0.04 – 0.86  the film scrubs from first frame to last
 *   0.10 – 0.34  BLISS resolves in gold foil, tracking closing in
 *   0.30 – 0.40  the title yields; the specs rail takes over
 *   0.86 – 1.00  the frame sinks into black, where the page continues
 *
 * Frames load coarse-to-fine (every 16th, then 8th, 4th…), so the whole
 * range is scrubbable almost immediately and sharpens as the rest arrive;
 * a missing frame is drawn as its nearest loaded neighbour.
 *
 * Phones get their own budget, because the desktop path stutters there:
 *   - half the frames, smaller, each held as an ImageBitmap so the browser
 *     can't evict the decoded pixels and re-decode them mid-scroll;
 *   - (touch is smoothed by Lenis' syncTouch, so the film needs no easing
 *     of its own);
 *   - the title animates opacity and transform only: no blur filter, no
 *     letter-spacing relayout, no foil repaint per frame.
 */

// Three chained 10s clips; ~2.2 screens of scroll per clip keeps the scrub slow.
const STAGE_VH = 680;
const FILM = [0.04, 0.86] as const;

type Frame = HTMLImageElement | ImageBitmap;
const dims = (f: Frame) => (f instanceof HTMLImageElement ? [f.naturalWidth, f.naturalHeight] : [f.width, f.height]);

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const lite = mobile || touch;
    const count = Math.max(1, mobile ? FRAMES.mobileCount : FRAMES.count);
    const src = (i: number) => (FRAMES.count ? (mobile ? FRAMES.mobile(i) : FRAMES.desktop(i)) : FALLBACK);
    const bitmaps = mobile && typeof createImageBitmap === 'function';

    const frames: (Frame | null)[] = Array(count).fill(null);
    let dirty = true;
    let cancelled = false;

    // Coarse-to-fine load order.
    const order: number[] = [];
    const seen = new Set<number>();
    for (let step = 16; step >= 1; step /= 2) {
      for (let i = 0; i < count; i += step) if (!seen.has(i)) (seen.add(i), order.push(i));
    }
    if (!seen.has(count - 1)) order.push(count - 1);

    let cursor = 0;
    const pump = () => {
      if (cancelled || cursor >= order.length) return;
      const i = order[cursor++];
      const img = new Image();
      img.decoding = 'async';
      img.src = src(i);
      img
        .decode()
        .then(() => (bitmaps ? createImageBitmap(img).catch(() => img) : img))
        .then((frame) => {
          if (cancelled) {
            if (frame instanceof ImageBitmap) frame.close();
            return;
          }
          frames[i] = frame;
          dirty = true;
        })
        .catch(() => {})
        .finally(pump);
    };
    for (let k = 0; k < (mobile ? 4 : 6); k++) pump();

    const sync = () => {
      // 1.5× is indistinguishable from 2× under a moving film on a phone and
      // fills ~44% fewer pixels per draw.
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      dirty = true;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);

    const nearest = (i: number) => {
      for (let d = 0; d < count; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };

    let lastIndex = -1;
    let lastP = -1;

    const stop = onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const {p, rect} = pinProgress(root);
      if (rect.bottom < 0) return;

      const film = range(p, ...FILM);
      const index = Math.round(film * (count - 1));
      if (index !== lastIndex || dirty) {
        const img = nearest(index);
        if (img) {
          const cw = canvas.width;
          const ch = canvas.height;
          const [iw, ih] = dims(img);
          // Without a film, the still breathes in slowly instead.
          const zoom = FRAMES.count ? 1 : lerp(1.02, 1.18, film);
          // A tall phone screen can't be covered by a wide or 4:5 frame
          // without cropping it to the label, so such a frame fills ~70% of
          // the height and feathers into black — the title and specs sit in
          // the dark above and below it. A vertical phone film (taller than
          // 2:3) is simply drawn full-screen.
          const tall = ch / cw > 1.25 && ih / iw < 1.5;
          const fill = tall ? 0.7 : 1;
          const s = Math.max(cw / iw, (ch * fill) / ih) * zoom;
          const w = iw * s;
          const h = ih * s;
          const x = (cw - w) / 2;
          const y = tall ? (ch - h) * 0.46 : (ch - h) / 2;
          ctx.fillStyle = '#07050a';
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, x, y, w, h);
          if (tall) {
            const f = h * 0.22;
            for (const [y0, y1] of [
              [y + f, y],
              [y + h - f, y + h],
            ]) {
              const g = ctx.createLinearGradient(0, y0, 0, y1);
              g.addColorStop(0, 'rgba(7,5,10,0)');
              g.addColorStop(1, 'rgba(7,5,10,1)');
              ctx.fillStyle = g;
              ctx.fillRect(0, Math.min(y0, y1) - 1, cw, f + 2);
            }
          }
          lastIndex = index;
          dirty = false;
        }
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const lift = range(p, 0, 0.12);
      veilRef.current!.style.opacity = String(1 - lift);
      // No zoom on phones: the veil only lifts.
      veilRef.current!.style.transform = lite ? `translate3d(0, ${-lift * 18}vh, 0)` : `translate3d(0, ${-lift * 18}vh, 0) scale(${1 + lift * 0.2})`;

      const tIn = easeOutCubic(range(p, 0.1, 0.34));
      const tOut = range(p, 0.3, 0.4);
      const title = titleRef.current!;
      title.style.opacity = String(tIn * (1 - tOut));
      if (lite) {
        // Phones: no zoom, the title just fades in and drifts up.
        title.style.transform = `translate3d(0, ${-p * 8 + (1 - tIn) * 3}vh, 0)`;
      } else {
        title.style.letterSpacing = `${lerp(0.5, 0.16, tIn)}em`;
        title.style.transform = `translate3d(0, ${-p * 8}vh, 0)`;
        title.style.filter = tIn < 0.99 && !reducedRef.current ? `blur(${(1 - tIn) * 12}px)` : '';
        const foil = title.querySelector<HTMLElement>('.foil');
        if (foil) foil.style.backgroundPosition = `${lerp(100, 0, clamp(p * 3))}% 0`;
      }

      const rail = range(p, 0.38, 0.48) * (1 - range(p, 0.78, 0.86));
      railRef.current!.style.opacity = String(rail);
      railRef.current!.style.transform = `translate3d(0, ${(1 - rail) * 20}px, 0)`;

      shadeRef.current!.style.opacity = String(easeOutCubic(range(p, 0.86, 1)));
      barRef.current!.style.transform = `scaleX(${film})`;
    });

    return () => {
      cancelled = true;
      ro.disconnect();
      stop();
      for (const f of frames) if (f instanceof ImageBitmap) f.close();
    };
  }, []);

  return (
    <section id="top" ref={rootRef} aria-label="Bliss" className="relative" style={{height: `${STAGE_VH}svh`}}>
      <div className="sticky top-0 h-screen-s overflow-hidden bg-night">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />

        {/* Vignette keeps type legible over any frame. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_40%,rgb(7_5_10/0.75))]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/80 to-transparent" />

        <div ref={titleRef} className="pointer-events-none absolute inset-x-0 top-[11%] text-center will-change-[transform,opacity] md:top-[14%]" style={{opacity: 0}}>
          <p className="font-mono text-label text-ivory/80 uppercase">{hero.kicker}</p>
          <h1 className="mt-3 font-display text-hero font-medium [text-shadow:0_6px_60px_rgb(0_0_0/0.6)]" style={{marginRight: '-0.16em'}}>
            <span className="foil">{hero.title}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-[22rem] px-4 font-display text-[1.25rem] text-ivory/90 italic md:text-[1.5rem]">{hero.tagline}</p>
        </div>

        <div ref={railRef} className="pointer-events-none absolute inset-x-4 bottom-8 flex flex-wrap items-end justify-between gap-4 will-change-[transform,opacity] sm:inset-x-6 md:inset-x-[3vw] md:bottom-10" style={{opacity: 0}}>
          <div>
            <p className="font-display text-[2rem] leading-none tracking-[0.2em] text-gold-2 md:text-[2.75rem]">BLISS</p>
            <p className="mt-2 font-mono text-label text-ivory/60 uppercase">KPerfume · a Kalliyath product</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-label text-ivory/75 uppercase">
            {hero.specs.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/10">
          <span ref={barRef} className="absolute inset-0 origin-left bg-gold" style={{transform: 'scaleX(0)'}} />
        </div>

        {/* Gold smoke on the lens. */}
        <div
          ref={veilRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
          style={{
            background:
              'radial-gradient(55% 45% at 30% 40%, rgba(232,163,61,0.35), transparent 70%), radial-gradient(45% 55% at 72% 62%, rgba(75,29,110,0.55), transparent 70%), radial-gradient(90% 90% at 50% 50%, rgba(18,12,22,0.88), rgba(7,5,10,0.97))',
          }}
        >
          <div className="text-center">
            <p className="font-mono text-label text-ivory/70 uppercase">KPerfume presents</p>
            <p className="mt-4 font-display text-[1.75rem] tracking-[0.4em] text-gold-2 uppercase md:text-[2.25rem]" style={{marginRight: '-0.4em'}}>
              Bliss
            </p>
            <p className="mt-6 font-mono text-label text-ivory/80 uppercase">{hero.veil}</p>
            <span aria-hidden="true" className="mt-4 inline-block animate-bounce text-gold motion-reduce:animate-none">
              ↓
            </span>
          </div>
        </div>

        <div ref={shadeRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-night" style={{opacity: 0}} />
      </div>
    </section>
  );
}
