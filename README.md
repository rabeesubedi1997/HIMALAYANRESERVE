# Himalayan Reserve

Astro (static) frontend + PHP admin/API backend for himalayanreserve.kitetool.com.

## Layout

- `astro-site/` — marketing site source (Astro + Tailwind v4). Built output
  lives in `astro-site/dist/` and is committed, so deployment never depends
  on running `npm install` on the production server.
- `php-backend/` — the actual live site: dynamic PHP homepage, admin CMS
  (`admin/`), public API (`api/`), all reading/writing MySQL via
  `inc/settings.php` + `config.php`.
- `db/schema.sql` — MySQL schema.
- `deploy.sh` — one-shot cPanel deployment script.

## Local development

```bash
cd astro-site
npm install
npm run dev        # Astro dev server, for editing the marketing site itself
```

To preview the full dynamic site (Astro assets + PHP), point a local PHP
server at a merged copy of `astro-site/dist/` + `php-backend/`, with a
`.env` set to your local MySQL credentials, e.g.:

```bash
php -S localhost:8891
```

## Rebuilding the Astro bundle

After changing anything in `astro-site/src/`:

```bash
cd astro-site
npm install
npm run build       # writes dist/, including stable dist/assets/site.css|js
```

Commit the updated `astro-site/dist/` along with your source changes —
`deploy.sh` uses it as-is and skips building on the server.

## Deploying to cPanel

On the server (see comments in `deploy.sh` for details):

```bash
git clone --branch master https://github.com/rabeesubedi1997/HIMALAYANRESERVE.git ~/himalayanreserve-src
cd ~/himalayanreserve-src
bash deploy.sh
```

This merges the pre-built Astro assets + `php-backend/` into the live
docroot, writes `.env`, imports `db/schema.sql`, and seeds the admin
account. Make sure the domain's Document Root in cPanel points at the
deployed folder (`~/himalayanreserve.kitetool.com`), not at
`himalayanreserve-src/astro-site/dist`.
