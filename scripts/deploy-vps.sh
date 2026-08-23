#!/usr/bin/env bash
# Publish the design booklet to the official site via SSH_* env vars.
# Required: SSH_HOST (IP or http(s)://IP/), SSH_PRIVATE_KEY
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST_RAW="${SSH_HOST:?SSH_HOST is required}"
KEY="${SSH_PRIVATE_KEY:?SSH_PRIVATE_KEY is required}"

python3 - "$HOST_RAW" <<'PY' >/tmp/vps_ip
import sys
from urllib.parse import urlparse
raw = sys.argv[1].strip()
u = urlparse(raw if "://" in raw else "ssh://" + raw)
print(u.hostname or raw, end="")
PY

umask 077
printf '%s\n' "$KEY" | sed 's/\r$//' >/tmp/vps_id
chmod 600 /tmp/vps_id
IP="$(cat /tmp/vps_ip)"
SSH=(ssh -i /tmp/vps_id -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)

"${SSH[@]}" "root@$IP" 'mkdir -p /var/www/chenaix/design'
tar -C "$ROOT" -czf - index.html assets | "${SSH[@]}" "root@$IP" 'tar -C /var/www/chenaix/design -xzf -'
"${SSH[@]}" "root@$IP" 'chown -R www-data:www-data /var/www/chenaix/design'
echo "published /design/"
