#!/usr/bin/env bash
#
# Himalayan Reserve — one-shot cPanel deployment (Astro static site + PHP backend)
# Run this in cPanel Terminal (Advanced > Terminal) from your home directory.
#
# It: gets the code (git pull/clone, or reuses an existing checkout — e.g. if
# you extracted the source tarball into $SRC_DIR yourself), builds the static
# Astro site, deploys the build output + the PHP admin/API backend to the
# live docroot, writes .env, imports the DB schema, and seeds the admin
# account. No Node.js app / Passenger registration is needed to SERVE the
# site — plain Apache/LiteSpeed + PHP does that. Node is only used here,
# transiently, to run the Astro build.
#
set -euo pipefail

# ── CONFIG ────────────────────────────────────────────────────────────────
SITE_URL="https://himalayanreserve.kitetool.com"
DOMAIN="himalayanreserve.kitetool.com"
LIVE_DIR="himalayanreserve.kitetool.com"     # live docroot folder under $HOME
SRC_DIR="himalayanreserve-src"               # separate checkout used only to build
REPO_URL="git@github.com:rabeesubedi1997/HIMALAYANRESERVE.git"  # private repo — needs a deploy key on the server, see README
BRANCH="master"
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_NAME="vertexen_himalayanreserve"
DB_USER="vertexen_himalayanreserve"
DB_PASS="qO5\$M5067mp9Hyih"                  # NOTE: \$ keeps the $ literal
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"                    # change after first login!

say()  { printf "\033[1;36m==>\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m[ok]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
fail() { printf "\033[1;31m[error]\033[0m %s\n" "$*" >&2; exit 1; }

SRC="$HOME/$SRC_DIR"
LIVE="$HOME/$LIVE_DIR"

# Locate a Node.js runtime: terminal PATH first, then CloudLinux's alt-nodejs
# installs (/opt/alt/alt-nodejsXX/root/usr/bin/node), then cPanel's EA installs.
# Only needed for step 3 (building the Astro site) — never at runtime.
find_node() {
  command -v node 2>/dev/null && return 0
  local v c
  for v in 24 22 20 19 18; do
    c="/opt/alt/alt-nodejs$v/root/usr/bin/node"
    [ -x "$c" ] && { echo "$c"; return 0; }
    c="/opt/cpanel/ea-nodejs$v/bin/node"
    [ -x "$c" ] && { echo "$c"; return 0; }
  done
  return 1
}
find_npm() {
  # Prefer the npm sitting next to the chosen node binary — using PATH's
  # npm here would run a DIFFERENT node (whatever `env node` resolves to)
  # via its shebang line, and an npm/node version mismatch crashes npm
  # internally ("Class extends value undefined is not a constructor").
  local dir="$(dirname "$1")"
  [ -x "$dir/npm" ] && { echo "$dir/npm"; return 0; }
  command -v npm 2>/dev/null && return 0
  return 1
}

# ── 1. Tool checks ─────────────────────────────────────────────────────────
say "Checking tools…"
# git is only needed if there's no source checkout yet and you're not using
# your own extracted tarball at $SRC — don't hard-fail on it here.
if command -v git >/dev/null 2>&1; then ok "git found"; else warn "git not found — fine if you extracted the source tarball into $SRC yourself."; fi

PHP="$(command -v php || true)"
[ -n "$PHP" ] || fail "php is not available in the terminal (needed to seed the admin account)."
ok "php found: $PHP ($("$PHP" -v | head -1 | tr -d '\n'))"

if command -v mysql >/dev/null 2>&1; then MYSQL=$(command -v mysql)
elif [ -x /usr/bin/mysql ]; then MYSQL=/usr/bin/mysql
else MYSQL=""; fi
[ -n "$MYSQL" ] || fail "mysql client not found in the terminal — needed to import the schema."
ok "mysql client found"

ok "checks done"

# ── 2. Code: reuse an existing checkout, or git clone/pull one ───────────
say "Preparing source at $SRC…"
mkdir -p "$SRC"
if [ -d "$SRC/astro-site" ] && [ -d "$SRC/php-backend" ]; then
  ok "source already present at $SRC — using it as-is"
  if [ -d "$SRC/.git" ]; then
    ( cd "$SRC" && git pull --ff-only origin "$BRANCH" ) || warn "git pull failed — keeping existing checkout."
  fi
elif [ -d "$SRC/.git" ]; then
  ( cd "$SRC" && git pull --ff-only origin "$BRANCH" ) || warn "git pull failed — keeping existing checkout."
elif [ -z "$(ls -A "$SRC" 2>/dev/null)" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$SRC" || fail "git clone failed. If you don't want to use git, extract the project source into $SRC yourself (must contain astro-site/ and php-backend/) and rerun."
else
  fail "$SRC exists but has no astro-site/php-backend and isn't a git repo — clear it out or fix it, then rerun."
fi
[ -d "$SRC/astro-site" ] || fail "astro-site/ missing from $SRC — wrong branch/repo state?"
[ -d "$SRC/php-backend" ] || fail "php-backend/ missing from $SRC — wrong branch/repo state?"
[ -f "$SRC/db/schema.sql" ] || fail "db/schema.sql missing from $SRC."
ok "source ready"

# ── 3. Astro static site: use the pre-built output if it's already in the
#      source tarball; only fall back to building on THIS server if it's
#      missing (some cPanel Node/npm installs are broken/mismatched and
#      crash npm with "Class extends value undefined is not a constructor" —
#      building locally and shipping dist/ sidesteps that entirely).
if [ -f "$SRC/astro-site/dist/assets/site.css" ] && [ -f "$SRC/astro-site/dist/assets/site.js" ]; then
  ok "pre-built static assets found in the source tarball — skipping Node/npm build"
else
  say "No pre-built dist/ found — building the Astro site on this server…"
  NODE="$(find_node || true)"
  [ -n "$NODE" ] || fail "no pre-built astro-site/dist/ was shipped, and no Node.js runtime is available here to build one. Build it on your own machine (cd astro-site && npm install && npm run build) and re-package the source tarball, or enable Node in cPanel > Setup Node.js App and rerun."
  NPM="$(find_npm "$NODE" || true)"
  [ -n "$NPM" ] || fail "npm not found alongside node at $NODE."
  # Put the resolved node's directory FIRST on PATH — npm's own script has a
  # "#!/usr/bin/env node" shebang, so without this it can launch a DIFFERENT,
  # mismatched node from PATH regardless of which binary we call by full path.
  export PATH="$(dirname "$NODE"):$PATH"
  ok "node found: $NODE ($("$NODE" -v))"
  rm -rf "$SRC/astro-site/node_modules" "$SRC/astro-site/package-lock.json"
  (
    cd "$SRC/astro-site"
    "$NPM" install --no-audit --no-fund
    "$NPM" run build
  ) || fail "Astro build failed on this server. Easiest fix: build astro-site/ locally (npm install && npm run build) and re-package/re-upload the source tarball with dist/ included — deploy.sh will then skip this step entirely."
  [ -f "$SRC/astro-site/dist/assets/site.css" ] || fail "Astro build did not produce dist/assets/site.css."
  [ -f "$SRC/astro-site/dist/assets/site.js" ] || fail "Astro build did not produce dist/assets/site.js."
fi
ok "static assets ready"

# The admin panel's JS (plain, unbundled) lives in php-backend/assets-src/ —
# regenerate php-backend/assets/ from it every run so it can never go stale.
mkdir -p "$SRC/php-backend/assets"
cp "$SRC/php-backend/assets-src/"*.js "$SRC/php-backend/assets/"
ok "admin JS synced"

# ── 4. Deploy: merge build output + PHP backend into the live docroot ────
say "Deploying to $LIVE…"
mkdir -p "$LIVE"

# Preserve media already uploaded through the admin media library, and any
# already-correct .env, before wiping old files (e.g. a previous deployment)
# out of the live docroot.
KEEP="$(mktemp -d)"
[ -d "$LIVE/uploads" ] && cp -r "$LIVE/uploads" "$KEEP/uploads" 2>/dev/null || true
[ -f "$LIVE/.env" ] && cp "$LIVE/.env" "$KEEP/.env" 2>/dev/null || true

find "$LIVE" -mindepth 1 -delete 2>/dev/null || true

# Only the compiled CSS/JS bundle + static public files come from the Astro
# build — NOT its dist/index.html. The homepage is dynamic PHP now
# (php-backend/index.php, copied below); leaving the static index.html in
# place too would risk Apache serving the stale static page instead.
mkdir -p "$LIVE/assets"
cp -r "$SRC/astro-site/dist/assets/." "$LIVE/assets/"
for f in favicon.ico icon.svg robots.txt sitemap.xml; do
  [ -f "$SRC/astro-site/dist/$f" ] && cp "$SRC/astro-site/dist/$f" "$LIVE/$f"
done
[ -d "$SRC/astro-site/dist/images" ] && cp -r "$SRC/astro-site/dist/images" "$LIVE/images"

# PHP backend: index.php (dynamic homepage), admin/, api/, inc/, uploads/,
# config.php, auth.php, .htaccess, and its own assets/ (admin-editor.js,
# admin-media.js) — merges into the same assets/ folder from above.
cp -r "$SRC/php-backend/." "$LIVE/"

if [ -d "$KEEP/uploads" ]; then
  mkdir -p "$LIVE/uploads"
  cp -n "$KEEP/uploads/." "$LIVE/uploads/" 2>/dev/null || true
fi
rm -rf "$KEEP"

find "$LIVE" -type d -exec chmod 755 {} \;
find "$LIVE" -type f -exec chmod 644 {} \;
ok "files deployed"

# ── 5. .env ───────────────────────────────────────────────────────────────
say "Writing .env…"
{
  printf 'DB_HOST=%s\n'     "$DB_HOST"
  printf 'DB_PORT=%s\n'     "$DB_PORT"
  printf 'DB_USER=%s\n'     "$DB_USER"
  printf 'DB_PASSWORD=%s\n' "$DB_PASS"
  printf 'DB_NAME=%s\n'     "$DB_NAME"
  printf 'SITE_URL=%s\n'    "$SITE_URL"
} > "$LIVE/.env"
chmod 600 "$LIVE/.env"
ok ".env written"

# ── 6. Database schema + admin seed ───────────────────────────────────────
say "Importing schema into $DB_NAME…"
awk '/^CREATE TABLE/{f=1} f' "$SRC/db/schema.sql" > "$LIVE/.schema.tmp.sql"
"$MYSQL" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" --force "$DB_NAME" \
  < "$LIVE/.schema.tmp.sql" \
  || warn "schema import had errors (--force used; tables may already exist)."
rm -f "$LIVE/.schema.tmp.sql"
ok "schema imported"

say "Seeding admin user ($ADMIN_USERNAME)…"
HASH="$("$PHP" -r 'echo password_hash($argv[1], PASSWORD_BCRYPT);' "$ADMIN_PASSWORD")"
"$MYSQL" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" -e "
  INSERT INTO users (username, password_hash, role) VALUES ('$ADMIN_USERNAME', '$HASH', 'admin')
  ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
" || warn "admin seed failed — see DEPLOY-README.txt in $LIVE for the manual SQL."
ok "admin seeded"

# ── 7. Done ────────────────────────────────────────────────────────────────
say "Deploy complete."
echo
echo "  Site:   $SITE_URL"
echo "  Admin:  $SITE_URL/admin/   (login: $ADMIN_USERNAME / $ADMIN_PASSWORD — change it!)"
echo "  Code:   $LIVE   (plain Apache + PHP — no Node.js app needed to run it)"
echo
warn "In cPanel > Setup Node.js App, make sure there is NO app registered for"
warn "$DOMAIN — a leftover registration can make Passenger intercept requests"
warn "instead of this site's static files/PHP. Destroy it if one exists."
