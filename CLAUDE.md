# Himalayan Reserve

Astro static frontend + PHP admin/API backend, deployed to cPanel shared hosting.
There is no Next.js / Node.js app running in production — Node is only used
transiently, on a build machine, to compile the Astro site.

- `astro-site/` — Astro v5 (static output) + Tailwind v4. `npm run build` emits
  `dist/`, which is committed to this repo so `deploy.sh` never has to run
  `npm install` on the (unreliable) cPanel Node environment.
- `php-backend/` — the live site: dynamic homepage (`index.php`, reads content
  from MySQL via `inc/settings.php`), admin panel (`admin/`, session auth,
  schema-driven CMS editor + media library), public API (`api/`).
- `db/schema.sql` — MySQL schema.
- `deploy.sh` — one-shot cPanel deploy: uses the pre-built `astro-site/dist/`,
  merges it with `php-backend/` into the live docroot, writes `.env`, imports
  the schema, seeds the admin user.

Whenever `astro-site/src/**` changes, rebuild locally (`cd astro-site && npm
install && npm run build`) and commit the updated `dist/` — don't rely on the
build running on the server.
