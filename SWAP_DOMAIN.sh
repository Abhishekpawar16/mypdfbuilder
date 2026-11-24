#!/usr/bin/env bash
# Usage: ./SWAP_DOMAIN.sh yourdomain.com   (replaces mypdfbuilder.com everywhere, then rebuild)
set -e
NEW="$1"; [ -z "$NEW" ] && { echo "usage: $0 yourdomain.com"; exit 1; }
grep -rl "mypdfbuilder\.com" index.html public src scripts 2>/dev/null | xargs sed -i "s/mypdfbuilder\.com/$NEW/g"
echo "Done. Run: npm run build"
