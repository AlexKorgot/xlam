#!/usr/bin/env bash
set -euo pipefail

die() {
  printf 'Preview deploy: %s\n' "$1" >&2
  exit 1
}

[[ "$(id -u)" != 0 ]] || die 'Run as the unprivileged preview deploy user, not root.'
[[ -n "${XLAM_PREVIEW_ROOT:-}" ]] || die 'Set XLAM_PREVIEW_ROOT explicitly.'
root="$(realpath -e -- "$XLAM_PREVIEW_ROOT")" || die 'Preview root does not exist.'
[[ "$(basename -- "$root")" == 'xlam-preview' ]] || die 'Preview root must be named xlam-preview.'
[[ -f "$root/.xlam-preview-root" && ! -L "$root/.xlam-preview-root" ]] || die 'Preview root marker is missing.'
[[ "$(cat -- "$root/.xlam-preview-root")" == 'xlam-preview' ]] || die 'Preview root marker is invalid.'
[[ ! -L "$root/releases" ]] || die 'Releases directory cannot be a symlink.'
mkdir -p -- "$root/releases"

release_link() {
  local link="$1" target
  [[ -L "$link" ]] || die "Expected release symlink: $link"
  target="$(readlink -- "$link")"
  [[ "$target" =~ ^releases/[0-9a-f]{40}$ ]] || die "Invalid release symlink: $link"
  [[ -d "$root/$target" ]] || die "Missing release for symlink: $link"
  printf '%s' "$target"
}

switch_current() {
  local target="$1" temporary="$root/.current-$$"
  [[ ! -e "$temporary" && ! -L "$temporary" ]] || die 'Temporary switch path already exists.'
  ln -s -- "$target" "$temporary"
  mv -Tf -- "$temporary" "$root/current"
}

case "${1:-}" in
  deploy)
    [[ "$#" == 3 ]] || die 'Usage: deploy-preview.sh deploy <extracted-out-dir> <40-character-commit-sha>'
    source_dir="$(realpath -e -- "$2")" || die 'Source directory does not exist.'
    [[ -d "$source_dir" ]] || die 'Source must be a directory.'
    [[ "$source_dir" != "$root" && "$source_dir" != "$root/"* ]] || die 'Source must be outside the preview root.'
    release_id="$3"
    [[ "$release_id" =~ ^[0-9a-f]{40}$ ]] || die 'Release ID must be a full Git commit SHA.'
    [[ -z "$(find "$source_dir" -type l -print -quit)" ]] || die 'Source may not contain symlinks.'
    for page in index.html main/index.html about/index.html contacts/index.html; do
      [[ -s "$source_dir/$page" ]] || die "Missing or empty page: $page"
    done
    [[ -f "$source_dir/build-info.json" ]] || die 'Missing build-info.json.'
    grep -Fq -- "\"commit\": \"$release_id\"" "$source_dir/build-info.json" || die 'Build revision does not match release ID.'

    release_dir="$root/releases/$release_id"
    incoming="$root/releases/.incoming-$release_id"
    [[ ! -e "$release_dir" && ! -L "$release_dir" ]] || die 'Release already exists.'
    [[ ! -e "$incoming" && ! -L "$incoming" ]] || die 'Incomplete incoming release needs inspection.'
    if [[ -e "$root/current" || -L "$root/current" ]]; then
      old_release="$(release_link "$root/current")"
    else
      [[ ! -e "$root/previous" && ! -L "$root/previous" ]] || die 'Previous link exists without current link.'
      old_release=''
    fi
    [[ ! -e "$root/previous" || -L "$root/previous" ]] || die 'Previous path is not a symlink.'

    mkdir -- "$incoming"
    cp -a -- "$source_dir/." "$incoming/"
    mv -- "$incoming" "$release_dir"
    if [[ -n "$old_release" ]]; then
      previous_tmp="$root/.previous-$$"
      [[ ! -e "$previous_tmp" && ! -L "$previous_tmp" ]] || die 'Temporary previous path already exists.'
      ln -s -- "$old_release" "$previous_tmp"
      mv -Tf -- "$previous_tmp" "$root/previous"
    fi
    switch_current "releases/$release_id"
    printf 'Preview now points to %s\n' "$release_id"
    ;;
  rollback)
    [[ "$#" == 1 ]] || die 'Usage: deploy-preview.sh rollback'
    release_link "$root/current" >/dev/null
    previous_release="$(release_link "$root/previous")"
    switch_current "$previous_release"
    printf 'Preview rolled back to %s\n' "${previous_release#releases/}"
    ;;
  *)
    die 'Usage: deploy-preview.sh deploy <extracted-out-dir> <commit-sha> | rollback'
    ;;
esac
