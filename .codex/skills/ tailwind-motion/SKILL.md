---
name: tailwind-motion
description: Coordinate Tailwind hover/transition utilities with GSAP motion.
---

# Tailwind Motion Rules

Use Tailwind for simple visual states:
- hover
- focus
- active
- color transitions
- opacity transitions
- transforms for lightweight interactions

Use GSAP for:
- orchestrated sequences
- timelines
- scroll-based motion
- complex entrance/exit animation

Avoid fighting GSAP with too many Tailwind transform utilities on the same element.
If GSAP animates transform-heavy properties, keep Tailwind transform usage minimal on that node.