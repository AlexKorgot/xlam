# Project Description

## Overview
- Next.js 16 App Router project (React 19, TypeScript, Tailwind CSS v4, Sass) focused on the XLAM Media landing.
- Root route `src/app/page.tsx` renders the immersive `MainScene`; there is also a placeholder `src/app/main/page.tsx` (server component) showing Cyrillic placeholder text.
- Global layout `src/app/layout.tsx` sets `lang="ru"`, applies `globals.css`, and wraps content in a flex column body with `overflow-x-hidden` to preserve animation stability.
- Tailwind is enabled through the new v4 `@import "tailwindcss"` directive inside `globals.css`. Custom CSS variables define the brand palette shared between Tailwind theme tokens and raw CSS.

## Key scripts & tooling
- `package.json`: Next 16.2.1, React/React-DOM 19.2.4, GSAP 3.14, `@gsap/react`, `clsx`, and `sass`. Dev tooling includes ESLint 9, Tailwind 4, and TypeScript 5.
- `npm run dev`, `build`, `start`, `lint` map directly to Next CLI / ESLint per AGENTS.md requirements.
- `tsconfig.json` exposes the `@/*` alias pointing at the repo root to keep imports short (e.g., `@/src/components/...`).
- `eslint.config.mjs` composes `eslint-config-next` rules (core web vitals + TypeScript) while explicitly ignoring build artifacts.

## src/app
- `globals.css`: defines theme CSS variables, background gradients, font family (expects "Normalidad"), plus helper animations (`fade-in`, `bounce`). Tailwind theme variables are inlined via `@theme inline`.
- `layout.tsx`: server layout; no client boundary; sets `<html lang="ru">`, `metadata`, and ensures antialiased, full-height document root.
- `page.tsx`: server component that simply renders `<MainScene />`.
- `main/page.tsx`: an additional route returning uppercase placeholder text (currently garbled due to encoding and missing proper Cyrillic literal handling).

## src/components/ui
- `MainScene.tsx`: **client** entry point for the hero experience. Composes `Header`, `FullPageScroll`, `FullPageSection`, and `SecondSectionDesign`. Maintains refs to `Header` and `SecondSectionDesign` imperative handles so both can react to scroll progress provided by `FullPageScroll`.
- `FullPageScroll.tsx`: custom full-screen scrolling controller built with GSAP's `Observer`. Handles wheel/touch/pointer/key events, animates vertical translations (`y: -index * viewportHeight`), manages reveal animations for elements marked with `[data-reveal]`, and exposes two callbacks:
  - `progressCallback(progress)` used to drive header/logo and section art progress between specific sections (currently hard-coded for indexes 0 - 1).
  - `sectionChangeCallback(index)` to inform parents when the section index updates. Also accepts `targetSection` prop to programmatically jump.
  Observer prevents default scroll to create a snap-to-section behavior and keeps cleanup for listeners/timelines.
- `FullPageSection.tsx`: tiny helper returning a full-viewport flexbox wrapper. Used to ensure every scroll section matches viewport height.
- `Header/Header.tsx`: `forwardRef` component exposing `setProgress`. Uses `gsap.timeline` to fade/slide nav text and synchronize with the animated logo. Text labels are currently Cyrillic but appear mojibake due to encoding�needs UTF-8 literal fix. `Header.module.scss` handles grid layout and responsive behavior, hiding side menus below 768px.
- `AnimatedLogoNew.tsx`: controls the hero-to-header logo morph. Places a centered logo (`logo.svg`) in the viewport and a compact plate/mark pinned to the top. Calculates translation/scale of the center logo so it lands exactly on the header logo. Progress is controlled imperatively (via `setProgress`) and synced with window resize to keep measurements accurate. Uses `next/image` with `unoptimized` so large PNG/SVG assets render as-is.
- `SecondSectionDesign.tsx`: `forwardRef` section that displays multiple floating brand objects (spring, sphere, metal tube, etc.) pulled from `src/lib/assets/main`. Maintains a GSAP timeline where each asset animates from custom offsets/rotations/delays. A pointer-driven parallax effect (using `gsap.quickTo`) activates once the reveal reaches ~96%. Title text lines (currently mojibake) fade/scale in between progress 0.52�0.94.
- `AnimatedLogoNew.tsx` + `SecondSectionDesign.tsx` both rely on `gsap.utils.mapRange` and custom progress mapping to sync with the `FullPageScroll` progress.
- `AsyncWrapper.tsx`: async server component returning its children after a 2s timeout (unused currently).
- `fallbacks/MainFallback.tsx`: simple suspense fallback showing `logo_big.svg` centered on screen.
- `grid/Container.tsx`: width-limited wrapper (`max-w-[1740px]`), not yet used in `MainScene`.
- `Text/Text.tsx`: placeholder client component meant for GSAP SplitText experimentation; currently just renders a `<p>` and leaves commented demo code. Registers `SplitText` but does not run any animation yet.
- `Header/HeaderExample.tsx`: alternate header demo that fades nav links based on `transitionProgress`. Useful reference but not wired into the main route.

## src/lib
- `assets/`: SVG logos plus PNGs for the hero collage (`main` subfolder). Includes `slider_bg.png` likely intended for the ScrollTrigger-based design seen in `designInScreen/3.png`.
- `fonts/`: numerous Normalidad font files (`.eot`, `.ttf`, `.woff`, `.woff2`). No `@font-face` or `next/font/local` setup yet, though `globals.css` references `--font-normalidad-compact`, so font loading still needs implementation.
- `styles/_mixins.scss`: collection of breakpoint and retina mixins with comments (currently mojibake). Not imported anywhere yet.

## Other top-level folders
- `designInScreen/`: design references (PNG exports). `3.png` mirrors the "������" slider concept with four mirrored portraits and neon green captions; useful for reproducing the horizontal slider with ScrollTrigger later.
- `public/`: default SVG placeholders from the initial Next template (unused in current UI).
- `.playwright-mcp/`, `.idea/`, `.codex/`: tooling/config directories; `.next/` contains build outputs (ignore).

## Routing & data flow summary
1. **Server layer**: App Router serves `layout.tsx` + `page.tsx`. No server data fetching yet.
2. **Client interactivity**: `MainScene` becomes the root client boundary, enabling GSAP usage. Scroll progress is centrally managed by `FullPageScroll` and distributed to `Header` + `SecondSectionDesign` for synchronized animation states.
3. **Assets management**: All hero imagery uses static PNG imports so Next can tree-shake and provide hashed asset URLs. `next/image` is explicitly `unoptimized`, prioritizing exact visuals over automatic resizing.

## Observations & follow-ups
- Cyrillic strings in `Header`, `SecondSectionDesign`, `_mixins.scss`, and `app/main/page.tsx` are currently double-encoded (mojibake). Replacing them with proper UTF-8 literals or extracting to a constants file would fix rendering.
- Normalidad fonts exist but are not loaded; need a `next/font/local` setup plus CSS variables to ensure typography matches the design mockups.
- `FullPageScroll` currently hardcodes progress tracking between sections 0 & 1. If more sections are added, adjust `shouldTrackProgress` logic to map new ranges.
- `designInScreen/3.png` suggests future work: a horizontal slider/pinned gallery (similar to the earlier ScrollTrigger snippet). Assets and `slider_bg.png` likely support that upcoming section.
- No lint/build/test commands have been run in this session; run `npm run lint` and `npm run build` after any notable change.
