## Codex-specific behavior

- Always prefer minimal edits over full rewrites
- Never break existing layout or structure
- For GSAP:
    - always use useGSAP
    - always scope animations
    - never use global selectors
- For Next.js:
    - never add "use client" unless required
    - never move server components to client without reason

## Codex Tailwind Behavior

- Prefer Tailwind for layout, spacing, typography, and responsive behavior
- Prefer mobile-first utilities
- Reuse existing spacing and typography patterns before inventing new ones
- Avoid arbitrary values unless necessary
- Avoid adding custom CSS when Tailwind is enough
- Extract repeated utility patterns into reusable components
- Keep Tailwind class lists readable and grouped logically
- Use GSAP for complex motion, not Tailwind utility transitions