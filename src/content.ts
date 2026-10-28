/**
 * Every word on the page. Product facts are taken from kperfume.in's Bliss
 * listing; this page is a scroll-driven concept demo, and it says so.
 */

export const brand = {
  name: 'KPerfume',
  product: 'Bliss',
  shopUrl: 'https://kperfume.in/products/bliss-unisex-perfume',
  whatsapp: 'https://wa.me/',
};

export const nav = [
  {label: 'Notes', href: '#notes'},
  {label: 'The bottle', href: '#gallery'},
  {label: 'Specs', href: '#specs'},
  {label: 'Wear', href: '#wear'},
  {label: 'Buy', href: '#buy'},
];

export const hero = {
  title: 'BLISS',
  kicker: 'Extrait de Parfum · Unisex',
  tagline: 'Bold at first breath, unforgettable at the last.',
  veil: 'Scroll to unveil',
  specs: ['30% oil concentration', 'Amber rose', '12+ hour longevity'],
};

/** The three tiers, in the order the skin meets them. */
export const notes = {
  eyebrow: 'Fragrance notes',
  heading: 'Three acts, one trail.',
  tiers: [
    {
      tier: 'Top',
      when: 'The first breath',
      names: ['Black currant', 'Saffron'],
      body: 'A dark, jammy fruit cut with the warm spice of saffron — the moment you spray.',
      tint: '#5a1f6e',
    },
    {
      tier: 'Heart',
      when: 'After the first hour',
      names: ['Rose'],
      body: 'The currant settles and a full red rose opens underneath, soft but certain.',
      tint: '#8c1c2b',
    },
    {
      tier: 'Base',
      when: 'What stays',
      names: ['Amber', 'Patchouli'],
      body: 'Resinous amber and earthy patchouli — the warmth people remember after you leave.',
      tint: '#b8741f',
    },
  ],
};

/**
 * Six chapters. Stills 1, 3 and 4 are cut from the hero film; 2, 5 and 6 are
 * editorial shots generated with Gemini from the product photo.
 */
export const gallery = {
  eyebrow: 'Inside the bottle',
  heading: 'What makes Bliss, Bliss.',
  intro: 'Six things worth knowing before your first spray.',
  items: [
    {
      image: '/media/still-1.webp',
      alt: 'Close view of the purple Bliss label',
      title: 'Extrait de Parfum',
      lead: 'The strongest form a perfume comes in.',
      body: 'Bliss carries 30% perfume oil. Most eau de toilettes sit at 10–15%, so every spray holds about twice the scent — you wear less, and it stays longer.',
    },
    {
      image: '/media/still-2.webp',
      alt: 'The Bliss bottle beside vials of amber perfume oil, a brass dropper, saffron and a red rose',
      title: 'French oils, Indian hands',
      lead: 'Blended by Kalliyath.',
      body: 'The fragrance oils are imported from France and blended by Kalliyath, the house behind KPerfume, and bottled at full Extrait strength in India.',
    },
    {
      image: '/media/still-3.webp',
      alt: 'Black currants, saffron threads and rose petals swirling around the bottle',
      title: 'An amber rose',
      lead: 'Fruity, floral, warm.',
      body: 'Black currant and saffron open it bright and a little exotic, a red rose holds the middle, and amber with patchouli leaves a warm, sensual finish. Unisex by design.',
    },
    {
      image: '/media/still-4.webp',
      alt: 'Ribbons of golden light wrapped around the bottle',
      title: 'Built to last',
      lead: '12+ hours on clothes.',
      body: 'Around four hours of projection on skin and twelve or more on garments. KPerfume backs it: if it doesn’t last 12+ hours on clothes, claim within two days of delivery for a full refund.',
    },
    {
      image: '/media/still-5.webp',
      alt: 'A fine golden mist spraying from the Bliss atomizer',
      title: 'How to wear it',
      lead: 'Spray, don’t rub.',
      body: 'Hold the bottle about a foot away and mist your pulse points — wrists, neckline, the back of the neck, inner elbows. Let it settle on its own; rubbing crushes the top notes.',
    },
    {
      image: '/media/still-6.webp',
      alt: 'The Bliss bottle and its box on a black marble shelf beside a dried rose',
      title: 'Keep it well',
      lead: 'Four-year shelf life.',
      body: 'Keep the cap on and store it somewhere cool and dry, away from heat and direct sun; it arrives in its own diamond-weave box. Alcohol denat., aqua, fragrance oils — flammable, external use only.',
    },
  ],
};

/** Published by KPerfume; the comparison is against a typical eau de toilette. */
export const specs = {
  eyebrow: 'By the numbers',
  heading: 'Twice the oil. Hours longer on you.',
  note: 'Figures as published by KPerfume.',
  rows: [
    {label: 'Perfume oil', bliss: 30, typical: 15, max: 30, unit: '%', typicalLabel: '10–15%'},
    {label: 'Lasts on clothes', bliss: 12, typical: 6, max: 12, unit: '+ hrs', typicalLabel: '3–6 hrs'},
    {label: 'Projection', bliss: 4, typical: 2, max: 4, unit: ' hrs', typicalLabel: '1–2 hrs'},
  ],
  facts: [
    ['Type', 'Extrait de Parfum'],
    ['Family', 'Amber floral'],
    ['Wears as', 'Unisex'],
    ['Sizes', '15ml · 100ml'],
    ['Shelf life', '4 years'],
    ['Made in', 'India'],
  ],
};

export const wear = {
  eyebrow: 'Where to wear it',
  heading: 'Bold enough for the night. Easy enough for the day.',
  items: [
    {name: 'Office', body: 'Close to the skin, warm and composed.'},
    {name: 'Gym', body: 'Fresh currant first, so it never feels heavy.'},
    {name: 'Long drive', body: 'Amber that lasts the whole road.'},
    {name: 'Party', body: 'Rose and saffron for when the lights go down.'},
  ],
};

export const buy = {
  eyebrow: 'Choose your size',
  heading: 'Make it yours.',
  sizes: [
    {size: '15ml', price: 399, mrp: 800, note: 'Pocket size — try it, carry it.'},
    {size: '100ml', price: 1249, mrp: 2500, note: 'The full bottle, boxed.', featured: true},
  ],
  perks: ['Free delivery on all orders', 'Cash on delivery', 'Surprise gift on prepaid orders', 'Made in India'],
  combo: 'Build a combo and save up to ₹2,000',
};
