# Services section

`ServicesSliderSection.tsx` composes the section and starts nearby media preloading.
The existing client entry points are `ServicesSliderSection.tsx` and `ServiceModal.tsx`;
their extracted components and hooks belong to the same client tree.

## Data

- `services.types.ts`: service, poster and modal content types.
- `services.data.ts`: card order, copy, videos, posters and modal content.
- `serviceModalBackground.ts`: responsive modal backgrounds and cached preloading.

## Slider

- `ServicesSlider.tsx`: Embla configuration and carousel layout.
- `ServiceSlideCard.tsx`: card markup, video playback, poster/loading states.
- `useServicesSliderGestures.ts`: wheel/drag edges and the vertical touch bridge to `FullPageScroll`.
- `useServicesDiscoveryHint.ts`: scoped GSAP discovery timeline and interaction cleanup.

## Modal

- `useServiceModal.ts`: preparation, opening, closing and circular service navigation.
- `ServiceModal.tsx`: connects modal state, transitions and presentation to `BaseModal`.
- `ServiceModalBody.tsx`: background, heading, description and contact CTA.
- `ServiceModalFeatures.tsx`: desktop features and the mobile picker, including snap motion and highlighting.
- `ServiceModalNavigation.tsx`: previous/current/next labels and their glitch effects.
- `useServiceModalTransition.ts`: background preparation, content fade timing and cancellation.

The shared `../modal/BaseModal.tsx` continues to own the sheet entrance/exit animation,
portal, scroll locking, focus and keyboard handling. Shared `GlitchText` and
`GlitchBrandXIcon` continue to own their effects. Keep those implementations shared.
