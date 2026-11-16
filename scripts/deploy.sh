#!/bin/sh
# Build the landing site for https://bobuk.io and copy it to the bobuk-io stack
# on oranges.team. static-web-server reads files on every request, so the new
# version is live as soon as rsync finishes.
set -eu
cd "$(dirname "$0")/.."

SITE_URL=https://bobuk.io
DEPLOY_HOST=${DEPLOY_HOST:-oranges.team}
DEPLOY_PATH=${DEPLOY_PATH:-/stacks/bobuk-io/data/public/}

npm run sync:github
SITE_URL=$SITE_URL ASTRO_TELEMETRY_DISABLED=1 npm run build
npm test
rsync -a --delete --delay-updates dist/ "$DEPLOY_HOST:$DEPLOY_PATH"

status=0
for path in / /ru/ /uk/ /sitemap.xml; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$SITE_URL$path?v=$(date +%s)")
  echo "$code $SITE_URL$path"
  [ "$code" = 200 ] || status=1
done
exit $status
