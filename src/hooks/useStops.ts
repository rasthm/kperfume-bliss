import {useEffect, type RefObject} from 'react';
import {addStops} from '../lib/scroll';

const START = [0] as const;

/**
 * Registers soft stops for a section. Each entry in `at` is progress
 * through the section's pinned span (0 = its top meets the viewport top,
 * 1 = the sticky child is about to unpin); a section that doesn't pin only
 * has 0. `at` must be a stable (module-level) array. `stepped` keeps the
 * page from resting between two of the stops (see `addStops`).
 */
export function useStops<T extends HTMLElement>(ref: RefObject<T | null>, at: readonly number[] = START, stepped = false) {
  useEffect(
    () =>
      addStops(
        () => {
          const el = ref.current;
          if (!el) return [];
          const top = el.getBoundingClientRect().top + window.scrollY;
          const span = Math.max(0, el.offsetHeight - window.innerHeight);
          return at.map((f) => top + f * span);
        },
        {stepped},
      ),
    [ref, at, stepped],
  );
}
