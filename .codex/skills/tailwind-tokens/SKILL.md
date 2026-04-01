---
name: tailwind-tokens
description: Keep Tailwind styling consistent with project tokens and design language.
---

# Tailwind Token Rules

Prefer existing project tokens, utilities, and patterns over inventing new ones.

Before adding new values:
- look for existing spacing rhythm
- look for existing text sizes
- look for existing radius and shadow usage
- look for existing color usage

Prefer:
- standard Tailwind scales
- existing project variables
- CSS variables when a project-level design token is needed

Avoid:
- too many arbitrary values like `px-[13px]`
- random one-off colors
- inconsistent breakpoint behavior