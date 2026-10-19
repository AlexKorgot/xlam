#!/usr/bin/env bash
set -euo pipefail

die() {
  printf 'Strapi deploy: %s\n' "$1" >&2
  exit 1
}

[[ -n "${VPS_DEPLOY_SSH_KEY:-}" ]] || die 'VPS_DEPLOY_SSH_KEY is missing.'
[[ "${GITHUB_SHA:-}" =~ ^[0-9a-f]{40}$ ]] || die 'GITHUB_SHA must be a full commit SHA.'
[[ "${GITHUB_RUN_ID:-}" =~ ^[0-9]+$ ]] || die 'GITHUB_RUN_ID is invalid.'
[[ "${GITHUB_RUN_ATTEMPT:-}" =~ ^[0-9]+$ ]] || die 'GITHUB_RUN_ATTEMPT is invalid.'

release_id="github-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
mode='stage'
if [[ "${STRAPI_DEPLOY_ENABLED:-}" == 'true' ]]; then
  mode='activate'
fi

for page in index.html main/index.html about/index.html contacts/index.html; do
  [[ -s "out/$page" ]] || die "Missing static page: $page"
done
[[ -f out/build-info.json ]] || die 'Missing build-info.json.'
python3 - "$GITHUB_SHA" <<'PY'
import json
import sys
with open('out/build-info.json', encoding='utf-8') as file:
    info = json.load(file)
if info.get('commit') != sys.argv[1]:
    raise SystemExit('Build revision does not match the workflow commit.')
PY
[[ -z "$(find out -type l -print -quit)" ]] || die 'Static build contains a symlink.'

ssh_dir="${RUNNER_TEMP:?}/xlam-deploy-ssh"
mkdir -m 700 -- "$ssh_dir"
printf '%s\n' "$VPS_DEPLOY_SSH_KEY" > "$ssh_dir/id_ed25519"
chmod 600 "$ssh_dir/id_ed25519"
unset VPS_DEPLOY_SSH_KEY
printf '%s\n' '80.78.247.172 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICtMNcMEhp3bc4QhEbi55bypBRYEd/ZUD0IMYWeNeaSu' > "$ssh_dir/known_hosts"
chmod 600 "$ssh_dir/known_hosts"
ssh_options=(-o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$ssh_dir/known_hosts" -i "$ssh_dir/id_ed25519")

archive="${RUNNER_TEMP}/xlam-${release_id}.tar.gz"
tar -C out -czf "$archive" .
scp "${ssh_options[@]}" "$archive" "xlam-deploy@80.78.247.172:/srv/xlam-deploy/${release_id}.tar.gz"

ssh "${ssh_options[@]}" xlam-deploy@80.78.247.172 "bash -s -- '$release_id' '$GITHUB_SHA' '$mode'" <<'REMOTE'
set -euo pipefail
release_id="$1"
commit="$2"
mode="$3"
[[ "$release_id" =~ ^github-[0-9]+-[0-9]+$ ]]
[[ "$commit" =~ ^[0-9a-f]{40}$ ]]
[[ "$mode" == stage || "$mode" == activate ]]

root=/srv/xlam-production
archive="/srv/xlam-deploy/${release_id}.tar.gz"
incoming="$root/releases/.incoming-$release_id"
release="$root/releases/$release_id"
[[ -f "$archive" && ! -L "$archive" ]]
[[ ! -e "$incoming" && ! -L "$incoming" ]]
[[ ! -e "$release" && ! -L "$release" ]]

cleanup() {
  rm -f -- "$archive"
  if [[ -d "$incoming" && ! -L "$incoming" ]]; then
    rm -r -- "$incoming"
  fi
}
trap cleanup EXIT

mkdir -- "$incoming"
tar -C "$incoming" -xzf "$archive" --no-same-owner --no-same-permissions
for page in index.html main/index.html about/index.html contacts/index.html; do
  [[ -s "$incoming/$page" ]]
done
python3 - "$incoming/build-info.json" "$commit" <<'PY'
import json
import sys
with open(sys.argv[1], encoding='utf-8') as file:
    info = json.load(file)
if info.get('commit') != sys.argv[2]:
    raise SystemExit('Uploaded build revision does not match the workflow commit.')
PY
chmod -R a+rX -- "$incoming"
mv -T -- "$incoming" "$release"
printf 'Verified release: %s\n' "$release"

if [[ "$mode" == activate ]]; then
  [[ -L "$root/current" ]]
  current_target="$(readlink -- "$root/current")"
  [[ "$current_target" == releases/*/out || "$current_target" == releases/* ]]
  [[ -d "$root/$current_target" ]]
  next="$root/.current-next-$release_id"
  [[ ! -e "$next" && ! -L "$next" ]]
  ln -s -- "releases/$release_id" "$next"
  mv -Tf -- "$next" "$root/current"
  printf 'Live site now points to %s\n' "$release_id"
else
  printf 'Release staged only; live site remains unchanged.\n'
fi
REMOTE
