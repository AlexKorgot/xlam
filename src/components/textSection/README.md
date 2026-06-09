# TextSection

`TextSection` is an MVP fullpage section based on the Figma reference frame `506:700`.

## Purpose

The section cycles through short text statements. Each statement owns a top artwork and a bottom artwork. During a change, the active text fades and moves out, the top artwork fades while moving upward, and the bottom artwork fades while moving downward. The incoming statement and artwork pair fades in during the same timeline so the section does not go blank between states.

## Assets

- `assets/img/general_bg.png`: persistent background pattern image with pointer parallax.
- `assets/img/blue_top.png`: current MVP top artwork.
- `assets/img/blue_bottom.png`: current MVP bottom artwork.

The slide data is already structured for unique `topImage` and `bottomImage` values per text. The MVP reuses the same two artwork files for all five slides because no alternate artwork files exist yet.

## Configuration

`TextSection` accepts `intervalMs`.

```tsx
<TextSection intervalMs={5000} />
```

Use a larger interval if the copy needs more reading time. The current animation duration is internal to the component and tuned for the `5000ms` MVP rhythm.

## Integration

The component renders its own `FullPageSection` with `id="text-section"`. It should be placed directly inside `FullPageScroll` and should not duplicate the global header.

## Maintenance Log

- Initial MVP: added five text slides, paired artwork slots, GSAP crossfade/movement timeline, and background pointer parallax.
- Visibility pass: increased the persistent background pattern opacity so `general_bg.png` reads as a visible watermark on the white section.
- Runtime fix: keyed the active and incoming artwork slots by slide id so inline GSAP exit styles cannot leak into the next active slide after a transition completes.
- Next.js API pass: replaced deprecated `next/image` `priority` usage with `loading="eager"` for the section images.
- Responsive pass: changed the top and bottom artwork containers to scale from viewport width using their native image aspect ratios, and increased the slide interval to `5000ms`.
- Background visibility fix: `general_bg.png` has very low intrinsic alpha, so it is now used as a CSS mask over a controlled blue watermark color instead of being rendered as a low-opacity image.
- Diagnostics pass: added `data-text-section-bg` to the parallax background layer so runtime checks target the mask layer instead of decorative artwork.
- Parallax fix: moved background parallax to explicit section `onPointerMove` and `onPointerLeave` handlers with lazy `gsap.quickTo` setters.
- Quick background fix: removed the CSS mask approach and rendered `general_bg.png` as a regular full-section image at full layer opacity because the PNG alpha was too low for mask-based rendering.
