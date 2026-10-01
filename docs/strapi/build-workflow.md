# GitHub Actions build for the Strapi working branch

`.github/workflows/build-strapi-preview.yml` runs only after a push to `strapi-integration`. It builds the static Next.js export and saves `out` as a seven-day GitHub Actions artifact. It has read-only repository permission and no deployment, VPS, SSH, Pages, or DNS steps. The existing `deploy.yml` for `master` is unchanged.

The build job remains skipped until the repository variable `STRAPI_BUILD_ENABLED` is set to `true`. Do this only after a test CMS is reachable over HTTPS from GitHub-hosted runners. `127.0.0.1` on a runner is not the developer's computer. The current local Strapi instance cannot be used by this job.

Before enabling the build, create the `strapi-preview-build` GitHub Environment and restrict it to the `strapi-integration` branch. Add these environment settings:

- Variable `STRAPI_URL`: the test CMS HTTPS origin, for example `https://cms.xlam.media` once configured.
- Secret `STRAPI_API_TOKEN`: a Content API token with read-only access to published Projects, Services, Services Section, Team Members, Homepage, Site Settings, and SEO Settings.

Then set repository variable `STRAPI_BUILD_ENABLED=true` and push a new commit to `strapi-integration`. The job checks the settings, installs dependencies from `package-lock.json`, builds the static site, verifies all four exported pages and their SEO metadata, checks that neither a local CMS address nor the API token appears in exported text files, and uploads `out`. The artifact contains `build-info.json` with its commit, run ID, and build time. Missing settings, CMS errors, invalid published content, or a failed export stop the job. The previous site release is unaffected.

GitHub requires a `workflow_dispatch` workflow to exist on the repository's default branch before it can be run manually. This workflow uses a branch-restricted push trigger so it can stay entirely on `strapi-integration`. Do not copy it to `vps`, `main`, or `master` without separate approval. A publish webhook and preview deployment will be handled in later stages.

## Separate preview prerequisites

The `deploy-strapi-device-preview.yml` workflow builds with checked-in fallback content; it is not a preview of published Strapi edits. Its GitHub Pages deployment currently fails because the `github-pages` environment does not allow `strapi-integration`. Do not weaken that protection or replace the existing Pages site as part of this build stage.

Before a real `preview.xlam.media` release, provide a reachable HTTPS CMS with persistent database and media storage, create DNS entries for the CMS and preview hostnames, and configure a separate preview document root on the VPS. Back up the current Nginx configuration and site paths first. The current production `xlam.media` and its Nginx configuration remain untouched.

`scripts/deploy-preview.sh` is a prepared, manual preview release helper. It has not been run on the VPS. An administrator must first create `/srv/xlam-preview` for an unprivileged deploy user, put the exact text `xlam-preview` in `/srv/xlam-preview/.xlam-preview-root`, and configure only the separate preview virtual host to serve `/srv/xlam-preview/current`. Store the GitHub Actions `out` artifact outside this directory, extract it, and verify `build-info.json`. Then, as the unprivileged user, set `XLAM_PREVIEW_ROOT=/srv/xlam-preview` and run `bash scripts/deploy-preview.sh deploy <extracted-out-directory> <full-commit-sha>`. The script copies into a new release directory, updates `previous`, and atomically switches `current`. It refuses root, an incorrectly named or unmarked root, missing pages, symlinks in the artifact, and a mismatched commit. It does not edit Nginx, touch the production document root, delete old releases, or run a build on the VPS. `bash scripts/deploy-preview.sh rollback` switches `current` back to the saved `previous` release. Test the preview host and its media before any production change.

A Strapi publish webhook cannot directly start this branch-only workflow through `workflow_dispatch` or `repository_dispatch`, because GitHub requires those workflows on the default branch. The later webhook stage therefore needs a branch-safe trigger design and a narrowly scoped GitHub credential, kept outside Git. Until that is configured, a push to `strapi-integration` is the only trigger for this build.
