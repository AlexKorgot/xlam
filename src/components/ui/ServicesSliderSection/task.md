# ServicesSliderSection Modal Task

- [x] Inspect Figma slider node `2442:484` and modal node `2427:402`.
- [x] Inspect `src/components/ui/ServicesSliderSection/ServicesSliderSection.tsx`.
- [x] Inspect `src/components/ui/ServicesSliderSection/ServicesSliderSection.module.scss`.
- [x] Locate section usage in `src/components/ui/MainScene.tsx`.
- [x] Search for existing modal, dialog, portal, overlay, or popup patterns in `src` and `pageComponent`.
- [x] Add local Figma modal assets under `src/components/ui/ServicesSliderSection/assets`.
- [x] Extend slide data in `src/components/ui/ServicesSliderSection/ServicesSliderSection.tsx` with modal content.
- [x] Create reusable modal UI in `src/components/ui/ServicesSliderSection/ServiceModal.tsx`.
- [x] Add slide click, modal open/close, previous/next state logic in `src/components/ui/ServicesSliderSection/ServicesSliderSection.tsx`.
- [x] Implement Escape, ArrowLeft, ArrowRight, backdrop close, focus, and body scroll locking.
- [x] Run `npm run lint` and `npm run build`, then fix issues.
- [x] Verify modal behavior in browser and update final notes in `src/components/ui/ServicesSliderSection/result.md`.

## Updated Modal Refinement

- [x] Inspect updated Figma modal node `2427:403` and parent modal frame `2427:402`.
- [x] Re-inspect `src/components/ui/ServicesSliderSection/ServiceModal.tsx`.
- [x] Re-inspect `src/components/ui/ServicesSliderSection/ServicesSliderSection.tsx`.
- [x] Check existing animation and modal/portal patterns in `src` and `pageComponent`.
- [x] Update `src/components/ui/ServicesSliderSection/ServiceModal.tsx` paddings, card sizing, footer placement, and responsive layout.
- [x] Add stable modal height/content regions in `src/components/ui/ServicesSliderSection/ServiceModal.tsx` to prevent footer jumps.
- [x] Add open/close animation with delayed unmount and reduced-motion handling in `src/components/ui/ServicesSliderSection/ServiceModal.tsx`.
- [x] Preserve slide-driven modal props and navigation from `src/components/ui/ServicesSliderSection/ServicesSliderSection.tsx`.
- [x] Run `npm run lint` and `npm run build`, then fix issues.
- [x] Verify modal open/close and arrow behavior in browser.

## ServiceModal Architecture Refactor

- [x] Inspect `src/components/ui/ServicesSliderSection/ServiceModal.tsx` responsibilities.
- [x] Inspect `src/components/ui/ServicesSliderSection/ServicesSliderSection.tsx` modal state and props usage.
- [x] Search existing modal, portal, dialog, popup, overlay, animation, scroll lock, and keyboard patterns.
- [x] Check Next.js client component and styling documentation for App Router boundaries.
- [x] Create reusable portal component in `src/components/ui/ServicesSliderSection/ModalPortal.tsx`.
- [x] Create reusable modal shell in `src/components/ui/ServicesSliderSection/BaseModal.tsx`.
- [x] Refactor `src/components/ui/ServicesSliderSection/ServiceModal.tsx` to render only service-specific modal content inside `BaseModal`.
- [x] Preserve `src/components/ui/ServicesSliderSection/ServicesSliderSection.tsx` modal state, props, previous/next behavior, and delayed unmount integration.
- [x] Run `npm run lint` and `npm run build`, then fix issues.
- [x] Verify open, close, Escape, backdrop, and arrow behavior in browser.
