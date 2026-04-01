---
name: tailwind-layout
description: Use Tailwind for layout, spacing, sizing, alignment, and responsive structure.
---

# Tailwind Layout Rules

Use Tailwind first for:
- flex, grid, gap, spacing, sizing, width, max-width, min-height
- alignment, positioning, responsive breakpoints
- section/container/page layout

Prefer:
- `mx-auto`, `px-*`, `py-*`, `gap-*`, `grid`, `flex`
- responsive variants like `sm:`, `md:`, `lg:`, `xl:`
- semantic structure first, utilities second

Avoid:
- unnecessary custom CSS for layout
- deeply duplicated class strings when a reusable component is better
- arbitrary values unless the design truly requires them

When building page sections:
- start mobile-first
- define max widths clearly
- keep spacing consistent across sections
- avoid over-nesting wrappers