---
name: tailwind-components
description: Build reusable UI in Tailwind without class chaos.
---

# Tailwind Component Rules

When markup becomes noisy:
- extract repeated patterns into reusable components
- keep class lists readable
- group classes logically: layout, spacing, typography, color, effects, state

Prefer:
- reusable wrapper components
- variant props for repeated button/card/badge patterns
- consistent hover/focus/disabled states

Avoid:
- copy-pasting large class strings across many files
- mixing multiple styling systems for the same concern
- introducing custom CSS when Tailwind handles it well enough