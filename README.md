# Anurag Vishwakarma — Portfolio Site

Production portfolio (replaces the old anurag-web-portfolio site). Vite + React +
TypeScript + Tailwind CSS v4 + Framer Motion. Design follows the approved
"Portfolio Design Mockup" artifact.

## Develop / build

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

## Structure

- `src/App.tsx` — page composition
- `src/components/` — Nav, SocialRail, Hero (typewriter + count-up stats),
  Work (Krishi Setu live card with a real screenshot of the production site),
  Skills (proof-based, no percentage bars), Journey, About, Contact, Footer,
  plus Reveal / CountUp / Typewriter / ScrollProgress primitives
- `src/index.css` — design tokens + component styles (dark theme, sky-blue accent)
- `public/avatar.jpg` — small hero avatar (150×150 profile image; swap this
  file with a real photo later — nothing else needs to change)
- `public/images/krishi-setu.png` — real screenshot of krishi-setu-lovat.vercel.app
- `public/resume.pdf` — downloadable résumé (regenerate from `resume/resume.html`
  by printing it to PDF at A4 with zero margins)

## 3D hero character

- `src/components/Character3D.tsx` — original Three.js implementation
  (mouse-tracked head/torso, gestures, soft contact shadow, accent rim
  light). Hero lazy-loads it **only on viewports ≥ 1024px**, so three.js
  and the model are never requested on mobile and never block first paint.
  Under `prefers-reduced-motion` it renders one static posed frame.
- Model: `public/models/character.glb` — **RobotExpressive** from the
  three.js examples (three.js is MIT-licensed; model by Tomás Laulhé,
  distributed with the three.js repo). It ships clips named `Idle`, `Wave`,
  `ThumbsUp`, `Yes` (plus more) and face morphs `Angry` / `Surprised` /
  `Sad` (only `Surprised` is used, briefly, with the wave).

### Swapping in a different character

Replace that **one file** — `public/models/character.glb` — and rebuild;
no code changes are needed. Behaviour contract for a replacement model:

- A clip named `Idle` becomes the looping base animation (if absent, the
  model's first clip is used).
- Clips named `Wave`, `ThumbsUp`, `Yes` enable the wave / CTA gestures;
  any missing clip simply disables that gesture.
- Bones named `Head` and `Torso` enable the extra head / upper-body
  mouse tracking (the whole body still follows without them).
- A `Surprised` morph target on a face mesh enables the expression beats.
- Framing is automatic (bounding-box fit) and the ground shadow sits at
  the model's feet, whatever its proportions.

## Deploy

Live preview: https://anurag-portfolio-rho-ten.vercel.app (includes the 3D
hero character). The original domain `anurag-web-portfolio.vercel.app` is
still pending: the Vercel account that owns that project still needs to be
linked. Once linked: import this folder as the project root (framework
preset: Vite, output: `dist/`), or run `vercel --prod` from this directory
after `vercel link`.
