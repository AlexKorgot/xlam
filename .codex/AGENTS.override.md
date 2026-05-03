## Codex-specific behavior

- Always prefer minimal edits over full rewrites.
- Never break existing layout or structure.
- Do not rewrite unrelated code.
- Follow existing project patterns before introducing new ones.
- Read the relevant files before editing.
- Use `task.md` as the source of truth for the current WebGL video slider task.
- Do not copy external skills or examples into the project without adapting them to this project.
- External skills are references only. Convert them into short, project-specific instructions before using.
- Avoid broad architecture changes unless explicitly required by `task.md`.

## Next.js Rules

- Project uses Next 16 with App Router.
- Never add `"use client"` unless required.
- WebGL, Three.js, GSAP, browser APIs, videos, canvas, `window`, `document`, `ResizeObserver`, `IntersectionObserver`, and `HTMLVideoElement` must only be used in client components.
- Never move server components to client without reason.
- Avoid hydration issues.
- Keep server/client boundaries correct.
- Dynamic import with SSR disabled is allowed for WebGL-heavy client components when needed.
- Do not access browser-only APIs during SSR.

## WebGL Video Slider Rules

- Main implementation target: `curved video slider → selected video plane unbends → fullscreen video background → DOM overlay`.
- Use vanilla Three.js, not React Three Fiber, unless explicitly requested.
- Use Three.js for the media layer only.
- Use DOM/React for text, navigation, buttons, tags, cards, accessibility, and case content.
- Do not render text or UI inside WebGL.
- Do not replace the active WebGL video with a second DOM video during the opening transition.
- The active `HTMLVideoElement` / `THREE.VideoTexture` should continue from slider state into fullscreen background state.
- Only one video should actively play at a time.
- Inactive slides should use posters or paused previews.
- Videos should be muted, looped, and `playsInline`.
- Add fallback behavior for autoplay failure.
- Avoid heavy post-processing unless explicitly requested.
- Do not use 4K video as the default asset.
- Support reduced-motion fallback.
- Support simplified mobile mode.

## Three.js Rules

- Use modular vanilla Three.js structure:
    - scene/controller setup
    - renderer lifecycle
    - resize handling
    - render loop control
    - video plane module/class
    - shader material module
    - dispose/cleanup
- Recommended renderer defaults:
    - `alpha: true`
    - `antialias: false`
    - `powerPreference: "high-performance"`
    - `preserveDrawingBuffer: false`
- Do not call `gl.finish()`.
- Do not use `preserveDrawingBuffer: true` unless explicitly required for screenshots/export.
- `requestAnimationFrame` is allowed for the interactive slider.
- Pause or reduce rendering when the section is offscreen, the tab is hidden, or no animation/video update is needed.
- Cap DPR:
    - desktop: max `1.5–2`
    - mobile: max `1–1.5`
    - low-power mode: `1`
- Dispose geometries, materials, textures, `VideoTexture`, renderer, event listeners, observers, RAF loop, and GSAP timelines on unmount.
- Prefer `ShaderMaterial` for the video planes.
- Avoid lights, shadows, physical materials, environment maps, and PBR-heavy patterns unless explicitly required.

## Shader / Texture Rules

- Use shader video planes for the curved slider and fullscreen morph.
- Plane geometry must have enough subdivisions for visible bending.
- Shader uniforms should support:
    - texture/video texture
    - bend amount
    - transition progress
    - active state
    - opacity
    - darkness/dim
    - velocity/motion amount
    - viewport size
    - media aspect ratio
    - plane size
- Shader should handle:
    - curved slider bend
    - unbend transition
    - fullscreen morph
    - video cover/crop
    - inactive slide dimming
    - optional velocity distortion
- Keep shader code focused and project-specific.
- Do not add generic shader demos, unrelated GLSL effects, or excessive examples.

## Skills Usage Rules

- Use `.agents/skills/threejs-compositions` only for modular Three.js lifecycle, Next client integration, render loop, resize, cleanup, and DOM overlay patterns.
- Use `.agents/skills/threejs-shaders` only for `ShaderMaterial`, uniforms, vertex deformation, video plane bend/unbend, and fullscreen morph.
- Use `.agents/skills/threejs-textures` only for `VideoTexture`, texture color space, filtering, UV cover/crop, media loading, and texture cleanup.
- Use `.agents/skills/threejs-interaction` only if WebGL raycasting is required.
- Do not add `threejs-lighting`, `threejs-materials`, `threejs-postprocessing`, `threejs-loaders`, `threejs-animation`, or `threejs-fundamentals` unless explicitly requested.
- Do not copy skills from external repositories as-is.
- Do not import Editframe-specific patterns from skills:
    - no `EFTimegroup`
    - no `addFrameTask`
    - no `renderToVideo`
    - no render clones
    - no `ef-timegroup`
    - no forced pure-function-of-time architecture
    - no `gl.finish()`
    - no required `preserveDrawingBuffer: true`

## Tailwind Rules

- Prefer Tailwind for layout, spacing, typography, sizing, and responsive behavior.
- Prefer mobile-first utilities.
- Reuse existing spacing and typography patterns before inventing new ones.
- Avoid arbitrary values unless necessary.
- Avoid adding custom CSS when Tailwind is enough.
- Extract repeated utility patterns into reusable components.
- Keep Tailwind class lists readable and grouped logically.
- Prefer existing reusable UI components before creating new utility-heavy markup.
- Do not use Tailwind transform utilities on elements controlled by GSAP.

## GSAP Rules

- Use GSAP only in client components.
- Prefer `@gsap/react` and `useGSAP()`.
- Always scope animations to refs.
- Never use global selectors.
- Always clean up animations.
- Use Tailwind for simple hover/transition states.
- Use GSAP for complex motion, timelines, WebGL transition orchestration, and scroll-based animation.
- Avoid using Tailwind transform utilities on elements animated by GSAP.
- Prefer animating opacity and transforms; avoid layout-thrashing properties when possible.
- GSAP should orchestrate Three.js uniforms and DOM overlay timing, not replace the Three.js render architecture.

## DOM Overlay Rules

- DOM overlay must follow the Figma design and project UI patterns.
- DOM overlay should contain:
    - navigation
    - headings
    - text
    - tags
    - buttons
    - cardsxnj
    - close/back controls
    - accessibility content
- Overlay states:
    - `slider`
    - `opening`
    - `opened`
    - `closing`
- Support Escape to close opened case where practical.
- Keep focus and button labels accessible.

## Coding Guidelines

- Make the smallest safe change possible.
- Do not invent APIs, props, hooks, utilities, or files that do not already exist unless required by the task.
- Do not refactor unrelated code.
- Preserve the existing architecture and naming conventions unless explicitly asked to change them.
- Read the relevant files before editing.
- Prefer targeted fixes over broad rewrites.
- If source code changes are made, run the relevant lint/build/typecheck command when available.