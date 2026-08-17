#!/usr/bin/env bash
#
# Himalayan Reserve — one-shot cPanel deployment
# Run this in cPanel Terminal (Advanced > Terminal) from your home directory.
# It: pulls the code, writes .env, imports the DB schema, seeds the admin
# account, and registers the Node.js app with the Application Manager.
#
set -euo pipefail

# ── CONFIG ────────────────────────────────────────────────────────────────
SITE_URL="https://himalayanreserve.kitetool.com"
DOMAIN="himalayanreserve.kitetool.com"      # subdomain (created below if missing)
APP_DIR="himalayanreserve"                  # folder under $HOME
REPO_URL="git@github.com:rabeesubedi1997/HIMALAYANRESERVE.git"
BRANCH="master"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="vertexen_himalayanreserve"
DB_USER="vertexen_himalayanreserve"
DB_PASS="Y*ItCOYil^2Eu\$ja"                 # NOTE: \$ keeps the $ literal
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"                   # change after first login!

say()  { printf "\033[1;36m==>\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m[ok]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
fail() { printf "\033[1;31m[error]\033[0m %s\n" "$*" >&2; exit 1; }

APP="$HOME/$APP_DIR"

# ── 1. Tool checks ─────────────────────────────────────────────────────────
say "Checking tools…"
command -v node >/dev/null 2>&1  || fail "node is not installed (install ea-nodejs20+ in cPanel)."
command -v git  >/dev/null 2>&1  || fail "git is not installed in the terminal."
command -v mysql >/dev/null 2>&1 || fail "mysql client is not available."
NODE_MAJOR=$(node -v 2>/dev/null | tr -dc '0-9' | cut -c1-2)
if [ "${NODE_MAJOR:-0}" -lt 20 ]; then
  warn "Node $NODE_MAJOR detected — Next.js needs Node 20+. Update it in Application Manager before starting the app."
fi
UAPI=""
if command -v uapi >/dev/null 2>&1; then
  UAPI=$(command -v uapi)
elif [ -x /usr/local/cpanel/bin/uapi ]; then
  UAPI=/usr/local/cpanel/bin/uapi
fi
[ -n "$UAPI" ] && ok "uapi available (application will be registered automatically)" \
               || warn "uapi not found — you will register the app in cPanel UI (Application Manager)."
ok "tools ok"

# ── 2. Subdomain (idempotent, best effort) ────────────────────────────────
SUB="${DOMAIN%%.*}"
ROOT_DOMAIN="${DOMAIN#*.}"
if [ -n "$UAPI" ]; then
  say "Ensuring subdomain $DOMAIN…"
  "$UAPI" --output=json SubDomain addsubdomain domain="$SUB" rootdomain="$ROOT_DOMAIN" \
    | grep -qi '"status": *1' && ok "subdomain ready" \
    || warn "subdomain create skipped (may already exist) — continueing."
fi

# ── 3. Code ───────────────────────────────────────────────────────────────
say "Preparing application at $APP…"
mkdir -p "$APP"
if [ -d "$APP/.git" ]; then
  ( cd "$APP" && git pull --ff-only origin "$BRANCH" ) || warn "git pull failed — keeping existing files."
else
  if [ -z "$(ls -A "$APP" 2>/dev/null)" ]; then
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP" || fail "git clone failed."
  else
    warn "$APP already contains files (no .git) — leaving them untouched."
  fi
fi
[ -f "$APP/app.js" ] || fail "app.js missing — the code did not deploy correctly."
[ -f "$APP/.next/standalone/server.js" ] || fail "prebuilt bundle missing (.next/standalone) — re-download from git."
ok "code ready"

# ── 4. .env ───────────────────────────────────────────────────────────────
say "Writing .env (600)…"
EXISTING_SECRET=""
[ -f "$APP/.env" ] && EXISTING_SECRET=$(grep -m1 '^ADMIN_SECRET=' "$APP/.env" | cut -d= -f2-)
ADMIN_SECRET="${EXISTING_SECRET:-$(openssl rand -hex 24 2>/dev/null || date +%s)}"
{
  printf 'DB_HOST=%s\n'   "$DB_HOST"
  printf 'DB_PORT=%s\n'   "$DB_PORT"
  printf 'DB_USER=%s\n'   "$DB_USER"
  printf 'DB_PASSWORD=%s\n' "$DB_PASS"
  printf 'DB_NAME=%s\n'   "$DB_NAME"
  printf 'ADMIN_SECRET=%s\n' "$ADMIN_SECRET"
  printf 'SITE_URL=%s\n'  "$SITE_URL"
} > "$APP/.env"
chmod 600 "$APP/.env"
ok ".env written (DB creds + admin secret, not in git)"

# ── 5. Database schema + admin seed ───────────────────────────────────────
say "Importing schema into $DB_NAME…"
awk '/^CREATE TABLE/{f=1} f' "$APP/db/schema.sql" > "$APP/.schema.tmp.sql"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" --force "$DB_NAME" \
  < "$APP/.schema.tmp.sql" \
  || warn "schema import had errors (--force used; tables may already exist)."
rm -f "$APP/.schema.tmp.sql"
ok "schema imported"

say "Seeding admin user ($ADMIN_USERNAME)…"
(
  cd "$APP/.next/standalone"
  DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" DB_USER="$DB_USER" DB_PASSWORD="$DB_PASS" \
  DB_NAME="$DB_NAME" ADMIN_USERNAME="$ADMIN_USERNAME" ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  node scripts/seed-admin.mjs
) || warn "admin seed failed — run it manually after deploy."
ok "admin seeded"

# ── 6. Register the Node.js app ───────────────────────────────────────────
if [ -n "$UAPI" ]; then
  say "Registering Node.js app (Application Manager)…"
  "$UAPI" --output=json PassengerApps register_application \
    domain="$DOMAIN" name="himalayanreserve" path="$APP" deployment_mode=production enabled=1 \
    && ok "application registered" \
    || warn "registration failed — add it in cPanel > Application Manager (Deployment Domain: $DOMAIN, App Path: $APP_DIR, startup file: app.js)."
else
  warn "Register the app in cPanel > Application Manager:"
  warn "  Deployment Domain: $DOMAIN | App Path: $APP_DIR | startup file: app.js"
fi

# ── 7. Done ───────────────────────────────────────────────────────────────
say "Deploy complete."
echo
echo "  Site:   $SITE_URL"
echo "  Admin:  $SITE_URL/admin   (login: $ADMIN_USERNAME / $ADMIN_PASSWORD — change it!)"
echo "  Code:   $APP   (startup file: app.js — loads .env automatically)"
echo
warn "Apache may need a minute to pick up the app. If the site 500s, re-register the"
warn "app in Application Manager or run:  $UAPI --output=json PassengerApps register_application domain=$DOMAIN name=himalayanreserve path=$APP deployment_mode=production enabled=1"
