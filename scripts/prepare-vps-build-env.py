#!/usr/bin/env python3
"""Create the private VPS build configuration without echoing the API token."""

import getpass
import os
import pathlib
import pwd


target = pathlib.Path('/srv/xlam-deploy/build.env')
if target.exists():
    raise SystemExit('Build configuration already exists; no file was changed.')

token = getpass.getpass('Paste the Strapi read-only API token, then press Enter: ').strip()
if not token or any(char.isspace() for char in token):
    raise SystemExit('Invalid token; no file was created.')

account = pwd.getpwnam('xlam-deploy')
flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
descriptor = os.open(target, flags, 0o600)
try:
    with os.fdopen(descriptor, 'w', encoding='utf-8') as file:
        file.write(f'STRAPI_API_TOKEN={token}\n')
        file.write('XLAM_ACTIVATE=false\n')
    os.chown(target, account.pw_uid, account.pw_gid)
except Exception:
    target.unlink(missing_ok=True)
    raise

print('Private build configuration created for xlam-deploy.')
