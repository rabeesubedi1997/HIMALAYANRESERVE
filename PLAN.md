# HIMALAYAN RESERVE — Premium Site Build Plan

> Root planning doc for the luxury single-page experience for Himalayan Reserve Coffee Pvt. Ltd.
> Source of truth: `ROYAL HIMALAYAN RESERVE COFFEE.docx` (+ reference sites: blackivorycoffee.com, cafedepanama.com, bluemountaincoffee.com/our-story).
> Status: DRAFT — awaiting approval before build. Owner: Dai Ktm / build agent.

---

## 1. Project Overview

**Product:** Himalayan Reserve — the world's highest handcrafted Himalayan coffee:

- Ancestral Single-Estate, Kaskikot, Nepal — 1,700m (5,580ft), under Annapurna peaks
- Two micro-lot "Crown Collections": **Ancestral Single-Estate Edition** + **Wild Civet Reserve** (world's most expensive, ~$2,200/kg claim, dethrones Black Ivory)
- Served **exclusively** at At.mosphere Lounge, Level 122, Burj Khalifa, Dubai (442m)
- Sold nowhere else — VIP Private Allocation (waitlist) only

**Stack (approved):** Next.js (App Router) — frontend + backend. **Database: MySQL 5.7.39** (Laragon's configured server, `D:\laragon\bin\mysql\mysql-5.7.39-winx64`, datadir `D:\laragon\data\mysql`, root/empty-password, port 3306 — verified running). VIP form stores submissions in MySQL via API route; WhatsApp/mailto compose kept as secondary channels.
**Media (approved):** video AND images; video where available, images with Ken Burns animation elsewhere. Fallback sourcing from free-license stock (Unsplash/Pexels) downloaded locally.
**Runtime:** Laragon `D:\laragon\www\CoffeeCafe`; Node v24.18.1 (System32 `node` stub shadows PATH — always use full path `C:\Program Files\nodejs\node.exe`).

---

## 2. Design System (Tokens)

### 2.1 Color Palette
| Token | Value | Usage |
|---|---|---|
| `--ink` | `#0B0B0B` | Page background (matte black) |
| `--ink-soft` | `#131313` | Cards, secondary surfaces |
| `--ink-lift` | `#1C1C1C` | Raised cards, hover states |
| `--gold` | `#D4AF37` | Headlines accents, CTAs, rules |
| `--gold-soft` | `#C9A227` | Hover, gradients |
| `--gold-dim` | `#8C7426` | Disabled, subtle borders |
| `--paper` | `#FFFFFF` | Body text, primary headlines |
| `--paper-dim` | `#B9B4A8` | Secondary text |
| `--paper-faint` | `#6E6A60` | Fine labels, meta |
| `--seal` | `#8E1F22` | Wax-seal red (accent only) |

Rules: gold = 10% of visual weight; white = 20%; matte black = 70%. Gold triggers only on meaningful elements.

### 2.2 Typography
| Role | Font | Fallback |
|---|---|---|
| Display / Headlines | **Cormorant Garamond** (500/600) + **Playfair Display** (600/700) | serif |
| Body / UI | **Montserrat** (300–600) | Inter |
| Labels / Eyebrows | Montserrat 11–12px, `letter-spacing: 0.32em`, uppercase | — |

Loaded via `next/font/google` (subsetting + self-hosted at build). Scale: 64/48/40/32/24/20/16/14/12/11.

### 2.3 Spacing & Layout
- Container: `max-w-[1400px]`, px-6, section py-24/32
- Grid: 12-col, breakpoints sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536
- Radius: cards 2px (sharp luxury aesthetic), pills/buttons 0–999px per case
- Hairline rules: 1px `rgba(212,175,55,0.25)` or `rgba(255,255,255,0.08)`

### 2.4 Motion (Motion Tokens)
| Token | Value |
|---|---|
| `--ease-lux` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| duration reveal | 1000–1400ms, stagger 80–120ms |
| hover | 300–500ms ease |
| video Ken Burns | 20–40s slow zoom |
| parallax drift | ±8–12% translate on scroll |

All reveal animations: `IntersectionObserver` (once, threshold 0.15) — respect `prefers-reduced-motion`.

### 2.5 Textures & Atmosphere
1. **Film Grain** — full-viewport fixed SVG noise `opacity: 0.04` (premium cinematic feel)
2. **Lokta-paper weave** — subtle SVG pattern on packaging section
3. **Smoke / mist gradient** — radial `rgba(255,255,255,0.04)` overlays on hero + section transitions
4. **Gold foil shimmer** — `background-position` sweep on gold text hover / badges
5. **Stone (Jato) texture** — duotone grain under Craft section
6. **Wax seal** — SVG badge `#8E1F22`, used on packaging + form success (stamp animation)

---

## 3. Site Architecture — Single Landing Page (`/`)

Hero sections map 1:1 to the docx. Structure + anchor ids:

| # | Section | Anchor | Content source (docx) |
|---|---|---|---|
| — | Preloader | — | Logo fade + gold line sweep (1.6s max) |
| — | Navbar (fixed) | — | Logo "HIMALAYAN RESERVE", menu: Collections · Ancestral Craft · Packaging · Dubai · Private Allocation |
| 1 | **Hero** | `#home` | Video bg + tagline + dual CTAs + stats strip |
| 2 | **Crown Collections** | `#collections` | Section 2 — two collection cards, pricing, tasting grids |
| 3 | **The Ancestral Craft** | `#craft` | Section 3 — 4 pillar cards + horizontal story gallery |
| 4 | **Eco-Luxury Packaging** | `#packaging` | Section 4 — Lokta paper + wax seal story |
| 5 | **Dubai Destination** | `#dubai` | Section 5 — Burj Khalifa / At.mosphere L122 exclusive |
| 6 | **Private Allocation** | `#allocation` | Section 6 — VIP form (WhatsApp/mailto) |
| 7 | Press Marquee | — | Kinetic strip: "World's Most Expensive Coffee · $2,200/kg · Dethrones Black Ivory · Served at 442m" |
| — | Footer + Back-to-top | — | Doc footer content |

---

## 4. Component Inventory & Conventions

### 4.1 Folder structure
```
app/
  layout.tsx          — fonts, metadata, providérs (SmoothScroll, Cursor, Grain)
  page.tsx            — assembles sections
  globals.css         — tokens, utilities, keyframes
  sitemap.ts, robots.ts, icon.svg
  api/allocations/route.ts — POST handler (zod → MySQL insert)
db/
  schema.sql          — database + table DDL (run via HeidiSQL or mysql CLI)
components/
  ui/        Button, Eyebrow, SectionHeader, GoldDivider, Stat
  effects/   Preloader, CustomCursor, ScrollProgress, GrainOverlay, Reveal, KenBurns, Parallax, Marquee, Counter
  layout/    Navbar, Footer, BackToTop
  sections/  Hero, StatsStrip, CrownCollections, CollectionCard, Craft, CraftGallery, Packaging, Dubai, AllocationForm, PressMarquee
lib/         content.ts (all copy=pulled from docx), motion.ts (easing consts), media.ts (asset registry), db.ts (mysql2 pool), validation.ts (zod schemas)
public/      video/, images/, textures/
```

### 4.2 Conventions
- One component per file, PascalCase; sections own their sub-components
- ALL user-facing copy lives in `lib/content.ts` (single source, easy edits for client)
- Media referenced ONLY through `lib/media.ts` (swap assets without touching markup)
- Tailwind utilities primarily; component-scoped CSS only for pseudo/keyframes
- Comments: none unless non-obvious (per project rule)

---

## 5. Premium Features Catalogue (from popular luxury sites)

### 5.1 Atmosphere / Global
- [ ] **Preloader** — logo monogram + gold line draw-in, max 1.6s (cafedepanama-style restraint)
- [ ] **Custom cursor** — small gold ring + dot, scales on interactive hover (desktop only)
- [ ] **Lenis smooth scroll** (CDN-free, npm `lenis`), eased inertia, anchor-aware
- [ ] **Scroll progress** — 2px gold line top of viewport
- [ ] **Film-grain overlay** fixed, `pointer-events: none`
- [ ] **Back-to-top** — gold ring appearing after 600px scroll

### 5.2 Navbar
- [ ] Fixed, transparent over hero → matte blur (`backdrop-blur`) + hairline gold on scroll
- [ ] Scroll-spy active link + gold underline animation
- [ ] Mobile: full-screen black overlay menu, staggered link reveal, "Allocation" CTA

### 5.3 Hero (video + image)
- [ ] `<video autoplay muted loop playsinline poster>` — user footage of Kaskikot mist / Annapurna / handpicking; `preload="metadata"`, lazy init, graceful fallback to poster image with Ken Burns
- [ ] Cinematic overlays: top/bottom black gradients + mist radial
- [ ] Headline staggered fade-up (Cormorant italic accent) — *"From the Roof of the World to the Top of the Sky."*
- [ ] Dual CTAs (gold filled / ghost) with magnetic hover + arrow slide
- [ ] **Stats strip** — count-up on view: 1,700m · 10 months · 3,100 boxes · 442m above clouds

### 5.4 Crown Collections
- [ ] Two asymmetric luxury cards (Ancestral = image-led, Civet = dark foil-led) on hairline gold grid
- [ ] 🏆 "WORLD RECORD — WORLD'S MOST EXPENSIVE COFFEE" badge (gold shimmer sweep)
- [ ] **Tasting-note cards** — Flavour / Notes / Finish / Aroma 4-up grid w/ hover tilt + glare (Black Ivory pattern)
- [ ] Pricing tiers with size selector feel: 100g / 250g / 1kg (+ 1 cup brewed for Civet); `@` gold pricing, secondary muted AED/USD
- [ ] **Currency toggle AED / USD / NPR** (prices in `lib/content.ts`, conversion static — no API)
- [ ] CTAs: "View Experience" → #dubai; "Apply for VIP Allocation" → #allocation

### 5.5 Ancestral Craft & Terroir
- [ ] Headline *"Purity Beyond Science — No Lab Experiments. No Chemicals."*
- [ ] 4 pillar cards: 1,700m Terroir / Handpicked by Master Elders / Firewood Roasting / Stone Grinding (Jato) — gold icon line, hover lift + border glow
- [ ] **Horizontal scroll gallery** (draggable + scroll-snap): terroir → elders handpicking → sun drying → firewood roasting → Jato grinding → stone-ground powder — images w/ Ken Burns
- [ ] "10 MONTHS OF HIMALAYAN PATIENCE" pull-quote with counter

### 5.6 Eco-Luxury Packaging
- [ ] Split layout: Lokta paper box + wax seal imagery | copy on CO2-neutral pouches, 90% Lokta paper (banknote-grade fiber), 10% upcycled coffee remnants, hand-stamped Royal Wax Seal
- [ ] **Interactive seal**: hover = stamp impression + gold ring; click = micro "stamp" animation

### 5.7 Dubai Destination
- [ ] Full-bleed dark section with Burj Khalifa silhouette line-art overlay
- [ ] Copy: "not sold in retail or online anywhere on Earth" — exclusivity emphasis
- [ ] Location card: At.mosphere Restaurant & Lounge, Level 122, Burj Khalifa, Downtown Dubai, UAE + "View on Map" (Google Maps link)

### 5.8 Press Marquee
- [ ] Infinite kinetic marquee (CSS translate loop, pause on hover): claims + press fragments, gold on dark

### 5.9 VIP Private Allocation Form
- [ ] Floating-label inputs: Full Name, Email, Phone/WhatsApp, Country/City, Inquiry Type (Private Collection / Royal Gifting / At.mosphere Reservation Inquiry), Message
- [ ] Validation (inline errors, gold focus rings)
- [ ] Submit → **POST `/api/allocations`** → row inserted in MySQL (source of truth), then wax-seal stamp success animation
- [ ] Channel buttons: "Send via WhatsApp" → `wa.me` prefilled link, "Send via Email" → `mailto` prefilled — both ALSO stored in MySQL on submit (store chosen `channel`)

### 5.9a Backend — MySQL Schema (`db/schema.sql`)
```sql
CREATE DATABASE IF NOT EXISTS himalayan_reserve
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE himalayan_reserve;

CREATE TABLE IF NOT EXISTS allocations (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(120)  NOT NULL,
  email       VARCHAR(190)  NOT NULL,
  phone       VARCHAR(60)   NOT NULL,
  country_city VARCHAR(120) NOT NULL,
  inquiry_type VARCHAR(32)  NOT NULL
              COMMENT 'private_collection|royal_gifting|atmosphere_reservation',
  message     TEXT          NULL,
  channel     VARCHAR(20)   NOT NULL DEFAULT 'form'
              COMMENT 'form|whatsapp|mailto',
  status      VARCHAR(20)   NOT NULL DEFAULT 'new'
              COMMENT 'new|contacted|allocated|declined',
  ip          VARCHAR(45)   NULL,
  user_agent  VARCHAR(255)  NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email  (email),
  KEY idx_status (status)
) ENGINE=InnoDB;
```
- Driver: **`mysql2/promise`** (no ORM codegen) — pool singleton in `lib/db.ts` (lazy, reused across requests)
- Config via `.env`: `DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD= DB_NAME=himalayan_reserve`
- **POST `/api/allocations`**: zod validation on server → sanitize → insert → duplicate guard (same email+phone within 10 min → 409) → return id
- Spam guard: honeypot field + minimum-submit-time check

### 5.10 Footer
- [ ] Full content from docx: company line, Nepal estate + Dubai partner addresses (anchored markers), email, © 2026, tagline strip "100% Single-Estate Organic · Zero Chemicals · Handcrafted in Nepal"
- [ ] Social placeholders (WhatsApp, Instagram) + subtle gold hairlines

### 5.11 SEO / Meta / A11Y
- [ ] Metadata + OpenGraph (1200×630 og image), Twitter card
- [ ] `sitemap.ts`, `robots.ts`, favicon/icon SVG (gold monogram)
- [ ] JSON-LD `Organization` + `Product` (two products, prices in AED)
- [ ] Semantic headings order, `aria-label`s, focus traps (mobile menu), `prefers-reduced-motion` support, alt text on all images, keyboard-accessible cards (buttons not divs)

---

## 6. Media Asset Plan

### 6.1 Video
| File | Use | Source |
|---|---|---|
| `public/video/hero.mp4` | Hero bg (mist, peaks, handpicking) | **USER FOOTAGE** (drop into folder; poster auto-fallback meanwhile) |
| `public/video/craft-loop.mp4` (optional) | Craft section ambient loop | user / fallback image Ken Burns |

### 6.2 Images (all in `public/images/`, referenced via `lib/media.ts`)
User files > fallback stock (Unsplash/Pexels, license-free, downloaded locally, credited in footer if used):

| Slot | Name | Subject | Animation |
|---|---|---|---|
| Hero poster | `hero-poster.jpg` | Kaskikot mist over Annapurna | slow zoom 20s |
| Collection 1 | `ancestral.jpg` | red cherries / handpicking / firewood roast | Ken Burns + hover zoom |
| Collection 2 | `civet.jpg` | forest garden / wild civet concept | Ken Burns + hover zoom |
| Craft x4 | `terroir.jpg` `handpick.jpg` `firewood.jpg` `jato.jpg` | 4 craft pillars | hover zoom |
| Packaging | `lokta-box.jpg` | Royal Box + wax seal | parallax drift |
| Dubai | `burj.jpg` | Burj Khalifa dusk / At.mosphere interior | parallax + slow zoom |
| OG | `og-cover.jpg` | 1200×630 brand frame | — |
| Textures | `grain.svg` `lokta.svg` `jato.svg` | SVG procedural | static |

---

## 7. Build Order (tracked)

- [x] **P0** Scaffold Next.js (TS + Tailwind + App Router), PATH workaround, commit baseline
- [x] **P0** Start+verify MySQL 5.7.39; run `db/schema.sql` (DB: `himalayan_reserve`); confirm via mysql CLI
- [x] **P0** Tokens + fonts + texture overlays + `content.ts` + `media.ts`
- [x] **P0** Effects layer: Reveal, Parallax, KenBurns, Counter, Marquee, Preloader, Cursor, ScrollProgress, Lenis
- [x] **P0** Navbar + Hero + Stats
- [x] **P0** Crown Collections + tasting cards + currency toggle
- [x] **P1** Craft pillars + horizontal gallery
- [x] **P1** Packaging + Dubai sections
- [x] **P1** VIP form (zod + `/api/allocations` + MySQL) + WhatsApp/mailto channels + Press marquee + Footer
- [x] **P2** SEO/meta/OG/sitemap/robots/JSON-LD/manifest/icon + a11y pass
- [x] **P2** `next build` clean, `npm run dev` verified, end-to-end form → MySQL row (id=1), checklist sign-off

## 8. Acceptance Checklist (sign-off before delivery)

- [x] Build completes with zero errors; dev server serves at `http://localhost:3000`
- [x] All 6 sections + marquee + footer render with copy matching docx verbatim
- [ ] Preloader → hero video/poster transitions cleanly *(needs user hero footage; poster fallback in place)*
- [ ] Every scroll animation fires once, smooth, no jank (dev uses poor-GPU throttling)
- [x] Currency toggle updates all pricing in place
- [x] Form validation works; submission inserts row into `himalayan_reserve.allocations` (verified via MySQL CLI); WhatsApp + mailto compose correct prefilled message
- [x] Mobile menu, 360px–1920px no overflow, images `next/image` responsive
- [ ] Lighthouse: Perf ≥ 90 (desktop), A11y ≥ 95, SEO ≥ 95
- [ ] `prefers-reduced-motion` disables Lenis + reveals without breaking layout
- [x] Media folder swap is effortless — single `mediaDefaults` edit in `content.ts` (assets already match)

---

## 9. Risks / Notes

- `C:\Windows\System32\node` (0-byte Store stub) shadows real Node → prepend `C:\Program Files\nodejs` to PATH in every shell command
- MySQL: **5.7.39 is the active Laragon server** (already running, port 3306, datadir `D:\laragon\data\mysql`). 8.0.40/8.4.3 binaries also installed — do NOT start them on 3306 simultaneously. `db/schema.sql` verified (5.7-compatible utf8mb4)
- next/font fetches Google Fonts at build — requires network (available)
- Keep conversion rates (AED/USD/NPR) static constants in `content.ts`; flag for client updates
- Any stock imagery used is a placeholder until user supplies real footage/farm photos
- No e-commerce/payment in scope (exclusivity + allocation model) — confirmed by doc