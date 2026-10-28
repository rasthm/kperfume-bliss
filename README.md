# KPerfume Bliss

A scroll-driven concept page for the Bliss unisex extrait de parfum. Product facts, notes and prices come from [kperfume.in](https://kperfume.in); this is a concept demo, not the official store.

**Live demo:** https://kperfume-bliss.orbit-fm.workers.dev

Built with Vite, React and TypeScript, and deployed on Cloudflare Workers.

```bash
npm install
npm run dev       # local preview
npm run build     # build into dist/
npm run deploy    # type-check, build and upload to Cloudflare
```

Every word on the page is in `src/content.ts`. The web images and video are in `public/`. The raw source media (`assets/`, `video/`) is not in this repo.
