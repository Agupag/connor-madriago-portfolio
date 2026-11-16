#!/bin/bash
# Build the site and publish dist/ to the gh-pages branch (GitHub Pages serves that branch).
# Pushing main alone does NOT update the live site.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO_URL="https://github.com/Agupag/connor-madriago-portfolio.git"
SITE="https://agupag.github.io/connor-madriago-portfolio"

npx vite build
TMP="$(mktemp -d)"
cp -R dist/. "$TMP/"
touch "$TMP/.nojekyll"
(
  cd "$TMP"
  git init -q -b gh-pages
  git add -A
  git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
    commit -q -m "Publish site build"
  git push -q -f "$REPO_URL" gh-pages
)
HASH="$(ls dist/app | grep '^index-.*\.js$')"
echo "Waiting for $HASH to go live..."
for i in $(seq 1 60); do
  if curl -s "$SITE/?t=$i" | grep -q "$HASH"; then echo "Live: $SITE/"; exit 0; fi
  sleep 5
done
echo "Not live after 5 minutes. If Pages did not rebuild, run:"
echo "  gh api -X POST repos/Agupag/connor-madriago-portfolio/pages/builds"
exit 1
