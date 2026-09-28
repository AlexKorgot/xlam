# Projects in the static site

The site reads published Strapi Projects while `next build` renders `/` and `/main`. The browser receives only the exported files in `out`; it does not call Strapi.

Set these variables in the build environment, not in Git:

```text
STRAPI_URL=https://cms.example.com
STRAPI_API_TOKEN=<read-only Content API token>
```

For a local build, put the variables in an ignored `.env.local` at the repository root. If both variables are absent outside CI, the existing projects in `src/components/cinematic_new/data.ts` are used. CI requires both variables. If only one is set, the API fails, no Projects are published, or a required field is invalid, the build fails. Keep the last successfully deployed static release in place when a build fails.

The query explicitly selects published entries, follows all pages, populates labels and media, and sorts by `sortOrder`. A unique harmless filter makes each build request fresh content instead of reusing a previous Next.js fetch cache entry. Project media can be selected in Strapi or entered as an HTTPS URL or root-relative public asset path. Existing visual settings stay in the React code.

Local verification completed with a temporary SQLite database: five published projects produced a successful static export; zero published projects caused a build failure; changing a title in Strapi appeared in a new `out` export, and the original title was restored. The GitHub Actions build is prepared in `build-workflow.md` and awaits a reachable test CMS. PostgreSQL, webhooks, preview deployment, and production deployment remain separate later stages.
