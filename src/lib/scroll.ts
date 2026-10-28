import Lenis from 'lenis';

/**
 * One rAF loop for the whole page. Lenis advances first, then every
 * scroll-driven component reads its own rect and writes styles directly —
 * nothing here goes through React state, so scrolling never re-renders.
 *
 * Lenis also drives touch (`syncTouch`), so wheel, trackpad and finger all
 * share one momentum model — which is what lets the soft stops below catch
 * a fast flick on a phone as well as on a laptop.
 */

type Tick = (time: number) => void;

const subscribers = new Set<Tick>();
let lenis: Lenis | null = null;

/* ------------------------------------------------------------------
   Soft stops
   Sections register scroll positions where the page should come to
   rest: the start of a section, each fragrance tier, each card. When
   the scroll is heading past one, it eases into the stop, the momentum
   is thrown away, and the page holds until the input goes quiet — so
   one flick moves one step. A continuous scroll is released after
   HOLD_MAX, so the page never feels stuck.
   ------------------------------------------------------------------ */

type StopSource = {at: () => number[]; stepped: boolean};
const stopSources = new Set<StopSource>();

/** Minimum pause at a stop, then wait for the wheel/finger to go quiet. */
const HOLD_MIN = 320;
const QUIET = 180;
const HOLD_MAX = 1100;
/** Within this many px of a stop counts as sitting on it. */
const EDGE = 2;

let phase: 'free' | 'settling' | 'holding' = 'free';
let holdStart = 0;
let lastInput = 0;
let auto = false;
/** Direction of the last user scroll: 1 down, -1 up. */
let lastDir = 1;

function release() {
  phase = 'free';
  lenis?.start();
}

// The hold is released from input events as well as from the frame loop,
// so it never outlives HOLD_MAX on a device that is dropping frames.
const markInput = () => {
  const now = performance.now();
  if (phase === 'holding' && now - holdStart > HOLD_MAX) release();
  lastInput = now;
};

/** A fresh touch after the momentum has died is a new, deliberate gesture. */
const onTouchStart = () => {
  const now = performance.now();
  if (phase === 'holding' && now - holdStart > HOLD_MIN && now - lastInput > QUIET) release();
};

/**
 * Registers soft stops. A `stepped` source (the fragrance tiers, the card
 * reel) also never comes to rest between two of its stops: a short flick
 * that runs out of momentum mid-way glides on to the next stop in the
 * direction it was going, so one flick always moves one step.
 */
export function addStops(at: () => number[], {stepped = false} = {}): () => void {
  const source = {at, stepped};
  stopSources.add(source);
  return () => {
    stopSources.delete(source);
  };
}

/** How long the glide into a stop takes, in seconds. */
const SETTLE = 0.6;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

function settleInto(l: Lenis, s: number) {
  phase = 'settling';
  // A fixed-length glide, not a lerp: a lerp's long tail would keep the
  // page locked (and ignoring the next flick) for well over a second.
  l.scrollTo(s, {
    duration: SETTLE,
    easing: easeOut,
    lock: true,
    force: true,
    onComplete: () => {
      if (phase !== 'settling') return;
      l.stop();
      phase = 'holding';
      holdStart = performance.now();
    },
  });
}

function gate(now: number) {
  const l = lenis;
  if (!l) return;
  if (phase === 'holding') {
    const held = now - holdStart;
    if (held > HOLD_MAX || (held > HOLD_MIN && now - lastInput > QUIET)) release();
    return;
  }
  if (phase !== 'free' || auto) return;

  const y = l.animatedScroll;
  const t = l.targetScroll;
  const clampStop = (raw: number) => Math.min(Math.max(0, raw), l.limit);

  const stops: {s: number; stepped: boolean}[] = [];
  for (const source of stopSources) for (const raw of source.at()) stops.push({s: clampStop(raw), stepped: source.stepped});
  stops.sort((a, b) => a.s - b.s);

  /**
   * After a stepped stop — inside the tiers or the reel, or in the run-out
   * from their last step to the next section — the page never rests
   * between two stops: if `at` falls in such a gap, the stop to glide to.
   */
  const stepFrom = (at: number): number | null => {
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (a.stepped && at > a.s + EDGE && at < b.s - EDGE) return lastDir > 0 ? b.s : a.s;
    }
    return null;
  };

  if (Math.abs(t - y) < 0.5) {
    // At rest (e.g. after a resize): don't sit in a stepped gap.
    if (now - lastInput < QUIET) return;
    const s = stepFrom(y);
    if (s !== null) settleInto(l, s);
    return;
  }
  const down = t > y;
  lastDir = down ? 1 : -1;

  // The first stop between where the page is and where it is heading.
  let hit: number | null = null;
  for (const {s} of stops) {
    const ahead = down ? y < s - EDGE && t >= s - EDGE : y > s + EDGE && t <= s + EDGE;
    if (ahead && (hit === null || (down ? s < hit : s > hit))) hit = s;
  }
  if (hit !== null) {
    settleInto(l, hit);
    return;
  }

  // No stop in the way. Once the input has finished, the target is where
  // the momentum will end — if that is inside a stepped gap, take the step
  // now rather than drift to a halt and then glide.
  if (now - lastInput > 90) {
    const s = stepFrom(t);
    if (s !== null) settleInto(l, s);
  }
}

export function startScroll(reducedMotion: boolean): () => void {
  if (!reducedMotion) {
    lenis = new Lenis({lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.85, syncTouch: true, syncTouchLerp: 0.08, touchInertiaExponent: 1.6});
    window.addEventListener('wheel', markInput, {passive: true});
    window.addEventListener('touchmove', markInput, {passive: true});
    // Capture phase, so the hold is lifted before Lenis sees the gesture.
    window.addEventListener('touchstart', onTouchStart, {passive: true, capture: true});
  }

  let raf = 0;
  const loop = (time: number) => {
    lenis?.raf(time);
    gate(performance.now());
    subscribers.forEach((fn) => fn(time));
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('wheel', markInput);
    window.removeEventListener('touchmove', markInput);
    window.removeEventListener('touchstart', onTouchStart, {capture: true});
    lenis?.destroy();
    lenis = null;
    phase = 'free';
    auto = false;
  };
}

export function onFrame(fn: Tick): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** Smooth-scrolls to an in-page hash like `#notes`, or to the top for `#top`. */
export function scrollToHash(hash: string) {
  const target = hash === '#top' ? 0 : document.querySelector<HTMLElement>(hash);
  if (target === null) return;
  if (lenis) {
    // Navigation flies straight there: no soft stops on the way.
    const l = lenis;
    phase = 'free';
    auto = true;
    l.start();
    l.scrollTo(target, {duration: 1.6, force: true, onComplete: () => (auto = false)});
  } else if (typeof target === 'number') {
    window.scrollTo({top: target});
  } else {
    target.scrollIntoView();
  }
  history.replaceState(null, '', hash === '#top' ? ' ' : hash);
}
