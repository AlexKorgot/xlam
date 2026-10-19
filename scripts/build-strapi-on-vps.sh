#!/usr/bin/env bash
set -euo pipefail

die() {
  printf 'Local Strapi build: %s\n' "$1" >&2
  exit 1
}

[[ "$(id -un)" == xlam-deploy ]] || die 'Run as xlam-deploy.'
[[ -n "${STRAPI_API_TOKEN:-}" ]] || die 'STRAPI_API_TOKEN is missing.'
[[ "$(pwd -P)" == /srv/xlam-deploy/source ]] || die 'Unexpected source directory.'

exec 9>/srv/xlam-deploy/build.lock
flock -x 9

root=/srv/xlam-production
release_id="cms-$(date -u +%Y%m%dT%H%M%SZ)-$$"
incoming="$root/releases/.incoming-$release_id"
release="$root/releases/$release_id"
[[ ! -e "$incoming" && ! -L "$incoming" ]]
[[ ! -e "$release" && ! -L "$release" ]]

export CI=true
export STRAPI_URL=https://cms.xlam.media
export NODE_OPTIONS=--max-old-space-size=2048
export GITHUB_SHA="$(git rev-parse HEAD)"
export GITHUB_RUN_ID="$release_id"

printf 'Building published Strapi content into %s\n' "$release_id"
npm run build
node scripts/verify-static-export.mjs out
[[ -z "$(find out -type l -print -quit)" ]] || die 'Static export contains a symlink.'

cleanup() {
  if [[ -d "$incoming" && ! -L "$incoming" ]]; then
    rm -r -- "$incoming"
  fi
}
trap cleanup EXIT

mkdir -- "$incoming"
cp -a -- out/. "$incoming/"
chmod -R a+rX -- "$incoming"
for page in index.html main/index.html about/index.html contacts/index.html; do
  [[ -s "$incoming/$page" ]] || die "Missing static page: $page"
done
mv -T -- "$incoming" "$release"
printf 'Verified release: %s\n' "$release"

if [[ "${XLAM_ACTIVATE:-}" != true ]]; then
  printf 'Release staged only; live site remains unchanged.\n'
  exit 0
fi

[[ -L "$root/current" ]] || die 'Live site is not a release symlink.'
old_target="$(readlink -- "$root/current")"
[[ "$old_target" == releases/*/out || "$old_target" == releases/* ]] || die 'Unexpected live release target.'
[[ -d "$root/$old_target" ]] || die 'Previous live release is missing.'
next="$root/.current-next-$release_id"
[[ ! -e "$next" && ! -L "$next" ]]
ln -s -- "releases/$release_id" "$next"
mv -Tf -- "$next" "$root/current"

if ! curl -fsS --max-time 15 --resolve xlam.media:443:127.0.0.1 \
  https://xlam.media/build-info.json |
  python3 -c 'import json,sys; assert json.load(sys.stdin)["runId"] == sys.argv[1]' "$release_id"; then
  rollback="$root/.current-rollback-$release_id"
  ln -s -- "$old_target" "$rollback"
  mv -Tf -- "$rollback" "$root/current"
  die 'Live HTTP check failed; previous release restored.'
fi

printf 'Live site now points to %s\n' "$release_id"
