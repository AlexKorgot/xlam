# Repository Guidelines

## Project Overview
This repository is a Next.js 16 App Router project using TypeScript, Tailwind, Sass, and GSAP.

Primary goals when editing this codebase:
- preserve Next.js 16 App Router conventions
- keep server/client boundaries correct
- avoid SSR or hydration issues
- use GSAP in a React-safe way
- keep changes minimal, targeted, and easy to review

## Project Structure & Module Organization
Application routes live in `src/app`, including the root page and route segments such as `src/app/main`.

Use these conventions:
- `src/app`: routes, layouts, pages, loading states, and route-level UI
- `src/components/ui`: reusable UI components
- `src/lib`: shared assets, fonts, utilities, and styles
    - `src/lib/assets`
    - `src/lib/fonts`
    - `src/lib/styles`
- `public`: static public assets
- `.next`: generated build output, never edit manually

Keep route folders lowercase. Keep reusable component files in PascalCase.

## Development Commands
Use these commands during development:

- `npm run dev`: start local dev server at `http://localhost:3000`
- `npm run build`: create a production build and catch route, type, and build issues
- `npm run start`: run the production build locally
- `npm run lint`: run ESLint checks

Before finishing any non-trivial change, run:
- `npm run lint`
- `npm run build`

## Coding Style & Naming Conventions
- Use TypeScript and preserve strict typing
- Prefer functional React components
- Prefer named exports where practical
- Use 2-space indentation in new files
- Use semicolons
- Match existing quote style in touched files
- Keep route folders lowercase under `src/app`
- Use PascalCase for component filenames, for example `Header.tsx` or `AnimatedLogoNew.tsx`
- Use the `@/` path alias for project-root imports where appropriate

## Styling Rules
- Prefer Tailwind utilities for layout, spacing, flex/grid, sizing, and responsive behavior
- Use colocated `*.module.scss` files for component-specific styling when Tailwind alone would make markup harder to read
- Do not introduce large global style changes unless the task explicitly requires them
- Reuse existing tokens, spacing patterns, and typography conventions before inventing new ones

## Next.js 16 App Router Rules
- Follow App Router patterns already used in the repository
- Default to Server Components unless client-side interactivity is required
- Add `'use client'` only when needed
- Do not move components to client unnecessarily
- Avoid introducing hydration mismatches
- Be careful when changing routing, layouts, metadata, or config
- Before changing framework APIs, routing behavior, or config, read the relevant guide in `node_modules/next/dist/docs/` and follow deprecation notes there

## GSAP Rules
Use GSAP with React and Next.js safely.

When adding or editing GSAP animations:
- prefer `@gsap/react` with `useGSAP()` over raw `useEffect()` where possible
- scope animations to a container ref
- clean up animations properly
- avoid running GSAP during SSR
- only run DOM-dependent animation code in client components
- register GSAP plugins before use
- use timelines for coordinated sequences instead of stacking many delays
- use `ScrollTrigger` only when the UX truly needs scroll-linked behavior
- call `ScrollTrigger.refresh()` after layout-changing operations when needed

Preferred pattern:
- client component
- `useRef()` for scope
- `useGSAP(() => { ... }, { scope: ref })`
- keep selectors scoped to the component instead of targeting the whole document

Avoid:
- direct DOM queries across the whole page
- unscoped animations
- long chains of hard-coded delays when a timeline is more appropriate
- animation logic inside Server Components
- introducing animation libraries in addition to GSAP unless explicitly requested

## Editing Guidelines
When making changes:
- keep edits minimal and localized
- do not rewrite unrelated code
- preserve existing architecture unless the task requires refactoring
- prefer small reusable components over copy-paste duplication
- preserve accessibility, semantic HTML, and keyboard usability
- avoid unnecessary dependency changes
- do not edit generated files

## Validation Checklist
Before considering work complete:
1. run `npm run lint`
2. run `npm run build`
3. verify the changed route/component still works in local development
4. for UI or animation changes, check for obvious hydration, layout shift, console, or runtime issues

## Testing Guidelines
There is no dedicated test runner configured yet.

Until one is added:
- every change should pass `npm run lint`
- every change should pass `npm run build`

If adding tests:
- place them near the feature as `*.test.ts` or `*.test.tsx`
- add the required npm script in the same PR

## Commit & Pull Request Guidelines
Use clear imperative commit messages, for example:
- `Add hero scroll animation`
- `Refactor header layout`
- `Fix hydration issue in main route`

Avoid placeholder commit messages.

PRs should include:
- a short summary
- linked issue if applicable
- verification commands run
- screenshots or recordings for UI changes

## Agent Behavior
When working in this repository:
- first understand the local component and route structure before editing
- prefer existing patterns over inventing new ones
- explain tradeoffs briefly when a change affects architecture
- for animation work, keep performance and cleanup in mind
- do not make broad framework or config changes unless explicitly requested

## Tailwind Guidelines
Use Tailwind as the default styling layer for layout, spacing, typography, sizing, and responsive behavior.

Prefer:
- utility classes for layout and spacing
- mobile-first responsive design
- existing spacing, radius, shadow, and typography patterns
- reusable components when class lists repeat

Avoid:
- unnecessary custom CSS for layout
- excessive arbitrary values unless clearly justified
- mixing Tailwind and Sass for the same concern
- large one-off utility strings repeated across files

When editing UI:
- preserve visual consistency with nearby sections
- keep class order readable and grouped logically
- favor semantic markup and accessible focus states