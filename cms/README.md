# XLAM MEDIA CMS

Self-hosted Strapi 5 Community application for editorial content. This source
tree is separate from the static Next.js site. It does not serve `xlam.media`.

## Configuration

Use PostgreSQL. Copy `.env.example` to an untracked `.env` and set a unique
database password and fresh random values for every secret. Never commit `.env`,
API tokens, database dumps, or uploaded files.

The server binds to `127.0.0.1` by default. Configure its public admin URL,
TLS proxy, PostgreSQL backups, dedicated non-root user, and REG.RU S3 upload
provider before deployment. None of those server changes are part of this
stage.

## Projects

`Project` is a collection type with Draft & Publish. `Project Label` and
`Project Preview` are repeatable components. Media fields support the Strapi
Media Library, while URL fields preserve the existing site's local media paths
for the first import. Do not publish imported drafts until their media is
reachable from the preview site and editorial values have been reviewed.

`data/projects.seed.json` contains the five original Projects. The import
script validates it and defaults to a dry run:

```sh
node scripts/import-projects.mjs
```

When Strapi and PostgreSQL are ready, set `CMS_BASE_URL` and a restricted
`CMS_WRITE_TOKEN`, then run `node scripts/import-projects.mjs --apply`.
The script creates **drafts only**, skips existing keys, and never overwrites
entries. It does not upload media or alter the static site.

With `CMS_BASE_URL` and a restricted `CMS_READ_TOKEN`, run
`node scripts/check-published-projects.mjs` to check that the published API
returns nonempty, ordered, complete Projects. The future static build must
fail if this check fails; the existing deployed version stays in place.

The initial source and mapping are described in
`../docs/strapi/projects-migration.md`.

## Services

`Service` contains the carousel card and its detail modal content.
`Services Section` contains the shared copy below the carousel. The five original
services and their media URLs are prepared in `data/services.seed.json`.
`node scripts/import-services.mjs` validates them without changing Strapi;
`--apply-local` imports drafts into the local SQLite test database without an API
token. Back up `cms/.tmp/local-check.db` before using it. For a separately
configured Strapi instance, `--apply` uses `CMS_BASE_URL` and a restricted
`CMS_WRITE_TOKEN`. Both modes skip existing entries and create drafts only.
Published Services and Services Section are read by the site during the static
build when Strapi build variables are set. See
`../docs/strapi/services-migration.md`.

## Team Members

`Team Member` defines the name, role, order, and portrait or optional video for
one person in the team section. The nine current members are prepared in
`data/team-members.seed.json` but have not been imported into Strapi. The site
still reads `src/components/ui/TeamSection/team.data.ts`. See
`../docs/strapi/team-migration.md` for the mapping and the next migration step.
