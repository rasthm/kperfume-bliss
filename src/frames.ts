/**
 * The hero's frame sequence: the chained Gemini clips, stitched and cut to
 * WebP by scripts/frames.sh. Both counts are rewritten by that script; while
 * `count` is 0 the hero falls back to the still product shot.
 */
export const FRAMES = {
  count: 240,
  mobileCount: 120,
  desktop: (i: number) => `/frames/d/${String(i + 1).padStart(4, '0')}.webp`,
  mobile: (i: number) => `/frames/m/${String(i + 1).padStart(4, '0')}.webp`,
};

export const FALLBACK = '/media/bliss-hero.webp';
