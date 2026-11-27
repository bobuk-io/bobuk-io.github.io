#!/bin/sh
# Build the landing site for https://bobuk.io and copy it to the bobuk-io stack
# on oranges.team. The stack is a sigma static stack: its proxy serves a published
# copy of data/public, so after rsync `ss-static sync` publishes the new files.
set -eu
cd "$(dirname "$0")/.."

SITE_URL=https://bobuk.io
DEPLOY_HOST=${DEPLOY_HOST:-oranges.team}
DEPLOY_PATH=${DEPLOY_PATH:-/stacks/bobuk-io/data/public/}
DEPLOY_STACK=${DEPLOY_STACK:-bobuk-io}

npm run sync:github
SITE_URL=$SITE_URL ASTRO_TELEMETRY_DISABLED=1 npm run build
npm test
rsync -a --delete --delay-updates dist/ "$DEPLOY_HOST:$DEPLOY_PATH"
# Without this the proxy keeps serving the previous publish of a static stack.
# A Compose stack (no static.toml) serves data/public directly and needs nothing.
# The login shell there is fish, so the check runs in an explicit sh.
ssh "$DEPLOY_HOST" "sh -c 'if [ -f /stacks/$DEPLOY_STACK/static.toml ]; then /stacks/sigma/bin/ss-static sync $DEPLOY_STACK; fi'"

status=0
for path in / /ru/ /uk/ /sitemap.xml; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$SITE_URL$path?v=$(date +%s)")
  echo "$code $SITE_URL$path"
  [ "$code" = 200 ] || status=1
done
exit $status
