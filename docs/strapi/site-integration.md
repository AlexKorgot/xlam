# Projects, Services and Team in the static site

The site reads published Strapi Projects, Services, Services Section, and Team Members while `next build` renders `/`, `/main`, and `/about`. The browser receives only the exported files in `out`; it does not call Strapi.

Set these variables in the build environment, not in Git:

```text
STRAPI_URL=https://cms.example.com
STRAPI_API_TOKEN=<read-only Content API token>
```

For a local build, put the variables in an ignored `.env.local` at the repository root. The read-only token needs access to published Projects, Services, Services Section, and Team Members. If both variables are absent outside CI, the existing projects, services, and team members checked into the repository are used. CI requires both variables. If only one is set, the API fails, published content is missing, or a required field is invalid, the build fails. Keep the last successfully deployed static release in place when a build fails.

The query explicitly selects published entries, follows all pages, populates labels and media, and sorts by `sortOrder`. A unique harmless filter makes each build request fresh content instead of reusing a previous Next.js fetch cache entry. Project media can be selected in Strapi or entered as an HTTPS URL or root-relative public asset path. Existing visual settings stay in the React code.

Services use the same build-time pattern. Card text and media, detail modal text and backgrounds, ordered features, and the shared closing phrase come from Strapi. The existing carousel, modal, animation, navigation and visual layout stay in React. Root-relative service media URLs are checked against `public/` during the build; uploaded Strapi media URLs resolve against the CMS origin.

Team Members use the same pattern on all three routes. Names, roles, order, portraits, and optional videos come from Strapi. The picker, infinite scroll, selection, portrait placement, and animation remain in React. Root-relative portrait and video URLs are checked against `public/`; uploaded Strapi media URLs resolve against the CMS origin. New uploaded media needs a reachable storage provider before preview deployment.

Local verification completed with a temporary SQLite database: five published projects produced a successful static export; zero published projects caused a build failure; changing a title in Strapi appeared in a new `out` export, and the original title was restored. Five published Services and Services Section also produced a successful static export with their media paths in `/` and `/main`. Nine published Team Members produced a successful static export with their names and portraits in `/`, `/main`, and `/about`. The GitHub Actions build is prepared in `build-workflow.md` and awaits a reachable test CMS. PostgreSQL, webhooks, preview deployment, and production deployment remain separate later stages.
