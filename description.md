# Project Description

## Overview
- Next.js 16.2.1 App Router project for the XLAM Media landing experience.
- Core stack: React/React DOM 19.2.4, TypeScript, Tailwind CSS v4, Sass, GSAP 3.14, `@gsap/react`, Three.js 0.184, and Embla Carousel.
- Root route `src/app/page.tsx` renders the immersive `MainScene`; additional simple routes exist under `src/app/main`, `src/app/about`, and `src/app/contacts`.
- Global layout `src/app/layout.tsx` sets `lang="ru"`, loads local Normalidad fonts with `next/font/local`, applies `globals.css`, and wraps route content once in `HeaderProvider`.
- Tailwind is enabled through the v4 `@import "tailwindcss"` directive in `globals.css`; project color/font tokens are defined through CSS variables and Tailwind `@theme`.

## Key Scripts & Tooling
- `npm run dev`: starts the Next dev server.
- `npm run build`: creates the production/static export build.
- `npm run start`: runs the production server after a build.
- `npm run lint`: runs ESLint 9 with `eslint-config-next`.
- `next.config.ts` currently uses `output: 'export'`, unoptimized images, trailing slashes, and a production `basePath`/`assetPrefix` for the `xlam` repo path.
- `tsconfig.json` exposes the `@/*` alias from the repository root, so project imports commonly use paths such as `@/src/components/...`.

## src/app
- `layout.tsx`: server layout, local font setup, global `HeaderProvider`, and metadata.
- `page.tsx`: server component that renders `<MainScene />`.
- `globals.css`: base theme variables, Tailwind theme mapping, full-page background, Normalidad font usage, and simple helper animations.
- `main/page.tsx`, `about/page.tsx`, `contacts/page.tsx`: additional route entries.

## Main Experience
- `src/components/ui/MainScene.tsx`: client root for the landing sequence. It composes `FullPageScroll`, `FullPageSection`, `SecondSectionDesign`, `ServicesSliderSection`, `MorphSection`, and `cinematic_new/CinematicVideoSlider`.
- `HeaderProvider`: renders `Header` once globally and exposes `useHeaderProgress()` so `MainScene` can drive header/logo progress without duplicating the scene.
- `FullPageScroll.tsx`: GSAP Observer-based full-page section controller. It owns the current section index, animates the translated section container, manages `[data-reveal]` elements, handles keyboard/wheel/touch input, and exposes `FULLPAGE_SCROLL_EVENT` for nested sections.
- `FullPageSection.tsx`: full-viewport section wrapper using `100svh`.
- `SecondSectionDesign.tsx`: imperative GSAP section with floating assets and progress-driven title/object animation.
- `ServicesSliderSection`: Embla services carousel with modal cards. The carousel viewport uses `data-fullpage-scroll-ignore`, so vertical wheel/touch gestures must bridge back to `FullPageScroll` with `FULLPAGE_SCROLL_EVENT`.
- `MorphSection`: imperative GSAP/video section started by `MainScene` after `FULLPAGE_SECTION_REVEAL_DELAY`.
- `src/components/cinematic_new`: active Three.js cinematic project slider. `SliderScene` owns renderer, video textures, resize/intersection/visibility observers, RAF lifecycle, and disposal.
- `src/components/cinematic`: older cinematic implementation retained as reference unless explicitly wired into the route.

## Mobile Scroll Notes
- `FullPageScroll` is the single owner of vertical section transitions.
- Nested interactive areas that set `FULLPAGE_SCROLL_IGNORE_ATTR` block the parent Observer by design.
- Such nested areas must dispatch `FULLPAGE_SCROLL_EVENT` for vertical gestures that should leave the nested component and move to the previous/next full-page section.
- The services carousel now needs `allowSectionScrollOnEdges` when used in `MainScene`, otherwise mobile swipes inside the Embla viewport will not advance the full-page section.
- Avoid rendering the route tree more than once. A duplicate `{children}` in layout duplicates GSAP timelines, Three.js renderers, videos, global listeners, and RAF loops.

## Known Follow-Ups
- Several Cyrillic literals are still mojibake in UI files and should be replaced with valid UTF-8 strings or centralized constants.
- Full-page progress mapping is still hard-coded around early sections; adding or reordering sections may require updating progress/transition callbacks.
- For any notable change, run `npm run lint` and `npm run build`, then verify the changed route in a browser with mobile viewport coverage.
