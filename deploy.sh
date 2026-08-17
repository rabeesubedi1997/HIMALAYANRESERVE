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
APP_DIR="himalayanreservenew"               # folder under $HOME
REPO_URL="git@github.com:rabeesubedi1997/HIMALAYANRESERVE.git"
BRANCH="master"
DB_HOST="127.0.0.1"                       # 127.0.0.1 (not localhost) — mysql2/node IPv6 quirk
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

# Locate a Node.js runtime: terminal PATH first, then cPanel's EA installs
# (/opt/cpanel/ea-nodejsXX/bin/node), then the Passenger-configured binary.
find_node() {
  command -v node 2>/dev/null && return 0
  local v c
  for v in 24 23 22 21 20 19 18; do
    c="/opt/cpanel/ea-nodejs$v/bin/node"
    [ -x "$c" ] && { echo "$c"; return 0; }
  done
  if [ -r /etc/cpanel/ea4/passenger.nodejs ]; then
    c=$(cat /etc/cpanel/ea4/passenger.nodejs)
    [ -x "$c" ] && { echo "$c"; return 0; }
  fi
  return 1
}

# ── 1. Tool checks ─────────────────────────────────────────────────────────
say "Checking tools…"
command -v git >/dev/null 2>&1 || fail "git is not installed in the terminal."
if command -v mysql >/dev/null 2>&1; then MYSQL=$(command -v mysql)
elif [ -x /usr/bin/mysql ]; then MYSQL=/usr/bin/mysql
else MYSQL=""; fi
[ -n "$MYSQL" ] && ok "mysql client found" || warn "mysql client not found — import schema via phpMyAdmin (db/schema.sql)."
NODE="$(find_node || true)"
if [ -n "$NODE" ]; then
  NODE_MAJOR=$("$NODE" -v 2>/dev/null | tr -dc '0-9' | cut -c1-2)
  [ "${NODE_MAJOR:-0}" -ge 20 ] && ok "node found: $NODE (v$NODE_MAJOR)" \
                                || warn "node v$NODE_MAJOR is old (need 20+); select a newer version in Application Manager."
else
  NODE_MAJOR=0
  warn "no node runtime found in the terminal — the app still runs, because Passenger"
  warn "supplies its own runtime, but pick a Node version (20+) in cPanel > Application"
  warn "Manager when you register the app. Admin seeding will be skipped for now."
fi
UAPI=""
if command -v uapi >/dev/null 2>&1; then UAPI=$(command -v uapi)
elif [ -x /usr/local/cpanel/bin/uapi ]; then UAPI=/usr/local/cpanel/bin/uapi; fi
[ -n "$UAPI" ] && ok "uapi available (application will be registered automatically)" \
               || warn "uapi not found — you will register the app in cPanel UI (Application Manager)."
ok "checks done"

# ── 2. Subdomain (idempotent, best effort) ────────────────────────────────
SUB="${DOMAIN%%.*}"
ROOT_DOMAIN="${DOMAIN#*.}"
if [ -n "$UAPI" ]; then
  say "Ensuring subdomain $DOMAIN…"
  "$UAPI" --output=json SubDomain addsubdomain domain="$SUB" rootdomain="$ROOT_DOMAIN" \
    | grep -qi '"status": *1' && ok "subdomain ready" \
    || warn "subdomain create skipped (may already exist) — continuing."
fi

# ── 3. Code ───────────────────────────────────────────────────────────────
say "Preparing application at $APP…"
mkdir -p "$APP"
if [ -d "$APP/.git" ]; then
  ( cd "$APP" && git pull --ff-only origin "$BRANCH" ) || warn "git pull failed — keeping existing files."
else
  if [ -z "$(ls -A "$APP" 2>/dev/null)" ]; then
    git clone --branch "$BRANCH" "$REPO_URL" "$APP" || fail "git clone failed."
  else
    warn "$APP already contains files (no .git) — leaving them untouched."
  fi
fi
[ -f "$APP/app.js" ] || fail "app.js missing — the code did not deploy correctly."
[ -f "$APP/.next/standalone/server.js" ] || fail "prebuilt bundle missing (.next/standalone) — re-pull from git."
ok "code ready (prebuilt bundle included — no build needed on the server)"

# ── 4. .env ───────────────────────────────────────────────────────────────
say "Writing .env (600)…"
EXISTING_SECRET=""
[ -f "$APP/.env" ] && EXISTING_SECRET=$(grep -m1 '^ADMIN_SECRET=' "$APP/.env" | cut -d= -f2-)
ADMIN_SECRET="${EXISTING_SECRET:-$(openssl rand -hex 24 2>/dev/null || date +%s)}"
{
  printf 'DB_HOST=%s\n'        "$DB_HOST"
  printf 'DB_PORT=%s\n'        "$DB_PORT"
  printf 'DB_USER=%s\n'        "$DB_USER"
  printf 'DB_PASSWORD=%s\n'    "$DB_PASS"
  printf 'DB_NAME=%s\n'        "$DB_NAME"
  printf 'ADMIN_SECRET=%s\n'   "$ADMIN_SECRET"
  printf 'SITE_URL=%s\n'       "$SITE_URL"
} > "$APP/.env"
chmod 600 "$APP/.env"
ok ".env written (DB creds + admin secret, not in git)"

# ── 5. Database schema + admin seed ───────────────────────────────────────
if [ -n "$MYSQL" ]; then
  say "Importing schema into $DB_NAME…"
  awk '/^CREATE TABLE/{f=1} f' "$APP/db/schema.sql" > "$APP/.schema.tmp.sql"
  "$MYSQL" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASS" --force "$DB_NAME" \
    < "$APP/.schema.tmp.sql" \
    || warn "schema import had errors (--force used; tables may already exist)."
  rm -f "$APP/.schema.tmp.sql"
  ok "schema imported"
else
  warn "skip schema import (no mysql client) — import db/schema.sql via phpMyAdmin."
fi

if [ -n "$NODE" ] && [ -f "$APP/.next/standalone/scripts/seed-admin.mjs" ]; then
  say "Seeding admin user ($ADMIN_USERNAME)…"
  (
    cd "$APP/.next/standalone"
    DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" DB_USER="$DB_USER" DB_PASSWORD="$DB_PASS" \
    DB_NAME="$DB_NAME" ADMIN_USERNAME="$ADMIN_USERNAME" ADMIN_PASSWORD="$ADMIN_PASSWORD" \
    "$NODE" scripts/seed-admin.mjs
  ) || warn "admin seed failed — run it manually after deploy."
  ok "admin seeded"
else
  warn "skip admin seed (no node runtime here) — after registering the app with a Node"
  warn "version, rerun:  bash deploy.sh   (it will seed then)."
fi

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
warn "If the site 500s: open cPanel > Application Manager, select the app, choose a"
warn "Node version (20+), and click Restart. Then rerun  bash deploy.sh  to seed admin."
