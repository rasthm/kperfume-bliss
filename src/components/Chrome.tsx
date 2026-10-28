import {useState, type MouseEvent} from 'react';
import {brand, nav} from '../content';
import {scrollToHash} from '../lib/scroll';

function go(e: MouseEvent<HTMLAnchorElement>, then?: () => void) {
  const hash = e.currentTarget.getAttribute('href');
  if (!hash?.startsWith('#')) return;
  e.preventDefault();
  then?.();
  scrollToHash(hash);
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 text-ivory">
      {/* A soft shade so the bar never sits directly on section text. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-night/90 via-night/60 to-transparent md:h-24" />
      <div className="relative flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5 md:px-[3vw]">
        <a href="#top" onClick={(e) => go(e)} aria-label={`${brand.name} — back to top`}>
          <img src="/media/k-perfume-logo.svg" alt="" className="h-5 w-auto md:h-6" />
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={(e) => go(e)} className="font-mono text-label text-ivory/75 uppercase transition-colors hover:text-gold-2">
              {item.label}
            </a>
          ))}
          <a href="#buy" onClick={(e) => go(e)} className="rounded-[4px] bg-gold px-4 py-2.5 font-mono text-label text-night uppercase transition-colors hover:bg-gold-2">
            Shop Bliss
          </a>
        </nav>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="menu" className="font-mono text-label uppercase md:hidden">
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <div id="menu" inert={!open} className={`fixed inset-0 -z-10 flex flex-col justify-center gap-6 bg-night/95 px-6 backdrop-blur-xl transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {nav.map((item, i) => (
          <a key={item.href} href={item.href} onClick={(e) => go(e, () => setOpen(false))} className="flex items-baseline gap-4 font-display text-[2.25rem] italic">
            <span className="font-mono text-label text-gold not-italic">0{i + 1}</span>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-night px-4 py-8 sm:px-6 md:px-[6vw]">
      <div className="flex flex-col gap-4 font-mono text-label text-ivory/45 uppercase md:flex-row md:items-center md:justify-between">
        <span className="text-ivory/75">Bliss · KPerfume · a Kalliyath product</span>
        <span>Scroll-driven concept demo · film and imagery generated with Gemini</span>
        <a href="#top" onClick={(e) => go(e)} className="hover:text-gold-2">
          Back to the top ↑
        </a>
      </div>
    </footer>
  );
}
