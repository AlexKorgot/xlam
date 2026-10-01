# GitHub Actions build for the Strapi working branch

`.github/workflows/build-strapi-preview.yml` runs only after a push to `strapi-integration`. It builds the static Next.js export and saves `out` as a seven-day GitHub Actions artifact. It has read-only repository permission and no deployment, VPS, SSH, Pages, or DNS steps. The existing `deploy.yml` for `master` is unchanged.

The build job remains skipped until the repository variable `STRAPI_BUILD_ENABLED` is set to `true`. Do this only after a test CMS is reachable over HTTPS from GitHub-hosted runners. `127.0.0.1` on a runner is not the developer's computer.

Before enabling the build, create the `strapi-preview-build` GitHub Environment and restrict it to the `strapi-integration` branch. Add these environment settings:

- Variable `STRAPI_URL`: the test CMS HTTPS origin, for example `https://cms.xlam.media` once configured.
- Secret `STRAPI_API_TOKEN`: a Content API token with read-only access to published Projects, Services and Services Section.

Then set repository variable `STRAPI_BUILD_ENABLED=true` and push a new commit to `strapi-integration`. The job checks the settings, installs dependencies from `package-lock.json`, builds the static site, checks the export, and uploads `out`. Missing settings, CMS errors, invalid Projects or Services, or a missing export fail the job. The previous site release is unaffected.

GitHub requires a `workflow_dispatch` workflow to exist on the repository's default branch before it can be run manually. This workflow uses a branch-restricted push trigger so it can stay entirely on `strapi-integration`. Do not copy it to `vps`, `main`, or `master` without separate approval. A publish webhook and preview deployment will be handled in later stages.
