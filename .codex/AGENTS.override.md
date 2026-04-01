## Codex-specific behavior

- Always prefer minimal edits over full rewrites
- Never break existing layout or structure
- Do not rewrite unrelated code
- Follow existing project patterns before introducing new ones

## Next.js Rules

- Never add "use client" unless required
- Never move server components to client without reason
- Avoid hydration issues
- Keep server/client boundaries correct

## Tailwind Rules

- Prefer Tailwind for layout, spacing, typography, sizing, and responsive behavior
- Prefer mobile-first utilities
- Reuse existing spacing and typography patterns before inventing new ones
- Avoid arbitrary values unless necessary
- Avoid adding custom CSS when Tailwind is enough
- Extract repeated utility patterns into reusable components
- Keep Tailwind class lists readable and grouped logically

## GSAP Rules

- Use GSAP only in client components
- Prefer @gsap/react and useGSAP()
- Always scope animations to refs
- Never use global selectors
- Always clean up animations
- Use Tailwind for simple hover/transition states
- Use GSAP for complex motion, timelines, and scroll-based animation