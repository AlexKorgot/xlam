Add or refactor GSAP animation in a Next.js-safe way.

Goals:
- implement animation without breaking SSR or hydration
- keep animation scoped and maintainable
- use modern GSAP + React patterns

Rules:
- use a client component only if required
- prefer `@gsap/react` and `useGSAP()`
- always scope animations to a ref
- never use global selectors (no document.querySelector on whole page)
- register GSAP plugins before use
- always clean up animations properly

Next.js constraints:
- never run GSAP during SSR
- do not convert server components to client without reason
- avoid hydration mismatches

Animation rules:
- use timelines instead of long delay chains
- use ScrollTrigger only when necessary
- call `ScrollTrigger.refresh()` if layout changes

Integration rules:
- use Tailwind for layout and basic transitions
- use GSAP for complex motion only

Constraints:
- do not break layout or structure
- do not modify unrelated code
- keep animation logic localized

Output:
- clean GSAP implementation
- no SSR issues
- scoped, reusable animation logic