<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/settings.php';

$s = hr_get_settings();
$seo = $s['seo'];
$hero = $s['hero'];
$stats = $s['stats'];
$press = $s['press'];
$ancestral = $s['ancestral'];
$civet = $s['civet'];
$craft = $s['craft'];
$packaging = $s['packaging'];
$dubai = $s['dubai'];
$faq = $s['faq'];
$nav = $s['nav'];
$footer = $s['footer'];
$media = $s['media'];

$siteUrl = rtrim(hr_env('SITE_URL', 'https://himalayanreserve.kitetool.com'), '/');
$canonical = $siteUrl . '/';

function h(string $v): string { return htmlspecialchars($v, ENT_QUOTES); }

$ldJson = [
    '@context' => 'https://schema.org',
    '@graph' => [
        [
            '@type' => 'Organization',
            'name' => $footer['legalName'],
            'url' => 'https://himalayanreserve.coffee',
            'email' => $footer['email'],
            'slogan' => $footer['tagline'],
            'location' => [
                ['@type' => 'Place', 'name' => 'Nepal Estate', 'address' => $footer['nepalEstate']],
                ['@type' => 'Place', 'name' => 'Dubai Partner', 'address' => $footer['dubaiPartner']],
            ],
        ],
        [
            '@type' => 'Product',
            'name' => $ancestral['name'],
            'description' => $ancestral['description'],
            'url' => 'https://himalayanreserve.coffee',
            'offers' => array_map(fn($t) => ['@type' => 'Offer', 'name' => $t['label'], 'price' => $t['price']['AED'], 'priceCurrency' => 'AED'], $ancestral['tiers']),
        ],
        [
            '@type' => 'Product',
            'name' => $civet['name'],
            'description' => $civet['description'],
            'url' => 'https://himalayanreserve.coffee',
            'offers' => array_map(fn($t) => ['@type' => 'Offer', 'name' => $t['label'], 'price' => $t['price']['AED'], 'priceCurrency' => 'AED'], $civet['tiers']),
        ],
    ],
];

$inquiryTypes = HR_INQUIRY_TYPES;
?>
<!doctype html>
<html lang="en" class="h-full antialiased">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= h($seo['title']) ?></title>
  <meta name="description" content="<?= h($seo['description']) ?>" />
  <meta name="keywords" content="<?= h($seo['keywords']) ?>" />
  <link rel="canonical" href="<?= h($canonical) ?>" />
  <?php if (!empty($seo['noindex'])): ?><meta name="robots" content="noindex, nofollow" /><?php endif; ?>

  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="<?= h($seo['ogTitle']) ?>" />
  <meta property="og:description" content="<?= h($seo['ogDescription']) ?>" />
  <meta property="og:image" content="<?= h($siteUrl . $seo['ogImage']) ?>" />
  <meta property="og:url" content="<?= h($canonical) ?>" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Playfair+Display:wght@400..800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="<?= htmlspecialchars(hr_asset_url('assets/site.css')) ?>" />

  <script type="application/ld+json"><?= json_encode($ldJson) ?></script>
</head>
<body class="min-h-full flex flex-col bg-ink text-paper">

  <div id="preloader" aria-hidden="true" class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-ink transition-opacity duration-700">
    <span class="max-w-[85vw] text-center font-display text-lg font-semibold tracking-[0.22em] text-paper sm:text-2xl sm:tracking-[0.42em] md:text-3xl">HIMALAYAN <span class="gold-text">RESERVE</span></span>
    <div class="h-px w-44 overflow-hidden bg-white/10"><div class="h-full w-full origin-left scale-x-0 [animation:loader_1.6s_var(--ease-lux)_forwards]"></div></div>
  </div>
  <div id="scroll-progress" aria-hidden="true" class="fixed left-0 top-0 z-[95] h-0.5 w-full opacity-0 transition-opacity duration-500">
    <div id="scroll-progress-bar" class="h-full w-full origin-left scale-x-0 bg-gold"></div>
  </div>
  <div aria-hidden="true" class="grain-overlay"></div>

  <!-- ===== Floating WhatsApp (quick contact) ===== -->
  <a
    href="https://wa.me/<?= h(preg_replace('/\D/', '', $footer['whatsapp'])) ?>"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    class="group fixed bottom-24 right-6 z-[85] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-ink shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-110"
  >
    <svg viewBox="0 0 32 32" width="24" height="24" fill="#0b0b0b" aria-hidden="true"><path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.56 1.692 6.475L2.667 29.333l7.03-1.844a13.27 13.27 0 0 0 6.307 1.605h.006c7.362 0 13.333-5.97 13.333-13.333s-5.976-13.094-13.339-13.094Zm0 24.02h-.005a11.06 11.06 0 0 1-5.633-1.542l-.404-.24-4.174 1.095 1.114-4.07-.263-.418a11.03 11.03 0 0 1-1.692-5.912c0-6.107 4.968-11.075 11.08-11.075 2.96 0 5.742 1.154 7.834 3.248a11 11 0 0 1 3.24 7.838c-.002 6.107-4.97 11.076-11.097 11.076Zm6.076-8.293c-.333-.167-1.97-.972-2.276-1.083-.306-.111-.528-.166-.75.167-.222.333-.86 1.083-1.055 1.305-.194.222-.389.25-.722.083-.333-.166-1.406-.518-2.678-1.65-.99-.884-1.66-1.976-1.854-2.309-.194-.334-.02-.514.146-.68.15-.15.334-.39.5-.584.167-.194.223-.333.334-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.807-1.028-2.475-.27-.65-.545-.562-.75-.573-.194-.01-.417-.012-.639-.012a1.23 1.23 0 0 0-.889.417c-.305.333-1.166 1.14-1.166 2.78s1.194 3.226 1.361 3.448c.166.222 2.35 3.585 5.694 5.028.795.343 1.415.548 1.898.7.797.253 1.523.218 2.096.132.64-.096 1.97-.805 2.248-1.583.278-.778.278-1.445.194-1.583-.083-.14-.305-.223-.639-.39Z"/></svg>
  </a>

  <!-- ===== Live Chat widget ===== -->
  <div id="chatWidgetRoot" class="fixed bottom-6 right-6 z-[86] flex flex-col items-end gap-3">
    <div id="chatPanel" class="hidden w-[340px] max-w-[85vw] flex-col overflow-hidden border border-white/15 bg-[#131316] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      <div class="flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3">
        <span class="font-display text-sm tracking-[0.08em] text-paper">Chat with Himalayan Reserve</span>
        <button type="button" id="chatCloseBtn" aria-label="Close chat" class="text-lg leading-none text-paper-dim hover:text-gold">✕</button>
      </div>
      <div id="chatBody" class="flex max-h-[65vh] min-h-[260px] flex-col"></div>
    </div>
    <button type="button" id="chatToggleBtn" aria-label="Open chat" class="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-110">
      <span class="text-2xl leading-none">💬</span>
    </button>
  </div>

  <!-- ===== Navbar ===== -->
  <header id="site-header" class="fixed inset-x-0 top-0 z-[80] border-b border-transparent bg-transparent transition-all duration-500 [transition-timing-function:var(--ease-lux)]">
    <div class="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
      <a href="#home" class="font-display text-lg font-semibold tracking-[0.32em] text-paper">HIMALAYAN <span class="gold-text gold-text--animated">RESERVE</span></a>
      <nav aria-label="Primary" class="hidden items-center gap-8 lg:flex">
        <?php foreach ($nav as $item): ?>
          <a href="#<?= h($item['id']) ?>" data-nav-link="<?= h($item['id']) ?>" class="group relative text-[0.72rem] font-medium uppercase tracking-[0.24em] text-paper-dim transition-colors duration-300 hover:text-paper">
            <?= h($item['label']) ?>
            <span data-nav-underline aria-hidden="true" class="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-500 [transition-timing-function:var(--ease-lux)] group-hover:w-full"></span>
          </a>
        <?php endforeach; ?>
      </nav>
      <a href="#allocation" class="hidden border border-gold/60 px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-gold transition-all duration-500 hover:bg-gold hover:text-ink lg:inline-block">Private Allocation</a>
      <button type="button" id="mobile-menu-btn" aria-label="Open menu" aria-expanded="false" class="flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden">
        <span class="h-px w-6 bg-paper transition-transform duration-300"></span>
        <span class="h-px w-6 bg-paper transition-transform duration-300"></span>
      </button>
    </div>
  </header>
  <div id="mobile-menu" class="pointer-events-none fixed inset-0 z-[75] flex flex-col justify-center bg-ink/[0.98] px-8 opacity-0 transition-opacity duration-500 lg:hidden">
    <nav aria-label="Mobile" class="flex flex-col gap-7">
      <?php foreach ($nav as $item): ?>
        <a href="#<?= h($item['id']) ?>" class="font-display text-4xl font-medium text-paper transition-all duration-500"><?= h($item['label']) ?></a>
      <?php endforeach; ?>
      <a href="#allocation" class="mt-4 inline-flex w-fit border border-gold px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.24em] text-gold">Private Allocation →</a>
    </nav>
  </div>

  <main>
    <!-- ===== Hero ===== -->
    <section id="home" class="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <video autoplay muted loop playsinline preload="metadata" poster="<?= h($media['heroPoster']) ?>" aria-label="Kaskikot mist over the Annapurna range" class="absolute inset-0 h-full w-full scale-105 object-cover [animation:kenburns_36s_ease-out_infinite_alternate]">
        <source src="<?= h($media['heroVideo']) ?>" type="video/mp4" />
      </video>
      <div aria-hidden="true" class="absolute inset-0 bg-ink/40"></div>
      <div aria-hidden="true" class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,11,0.5)_100%)]"></div>
      <div aria-hidden="true" class="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent"></div>
      <div class="relative mx-auto w-full max-w-[1400px] px-6 pb-24 pt-40 lg:px-10">
        <p class="reveal eyebrow mb-6 text-gold" data-reveal-delay="1"><?= h($hero['eyebrow']) ?></p>
        <h1 class="reveal max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-paper md:text-7xl lg:text-8xl" data-reveal-delay="2">
          <?= h($hero['title']) ?>
          <span class="mt-2 block italic text-transparent bg-gradient-to-r from-gold via-[#f3e5b0] to-gold bg-clip-text"><?= h($hero['titleAccent']) ?></span>
        </h1>
        <p class="reveal mt-8 max-w-xl text-base leading-relaxed text-paper-dim md:text-lg" data-reveal-delay="3"><?= h($hero['sub']) ?></p>
        <div class="reveal mt-10 flex flex-wrap gap-4" data-reveal-delay="4">
          <a href="#collections" class="group inline-flex items-center justify-center gap-3 bg-gold px-8 py-4 text-[0.8rem] font-medium uppercase tracking-[0.22em] text-ink transition-all duration-500 [transition-timing-function:var(--ease-lux)] hover:bg-paper hover:shadow-[0_0_40px_rgba(212,175,55,0.35)]">
            <span><?= h($hero['ctaPrimary']) ?></span><span aria-hidden="true" class="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
          </a>
          <a href="#dubai" class="group inline-flex items-center justify-center gap-3 border border-white/25 px-8 py-4 text-[0.8rem] font-medium uppercase tracking-[0.22em] text-paper transition-all duration-500 [transition-timing-function:var(--ease-lux)] hover:border-gold hover:text-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.12)]">
            <span><?= h($hero['ctaSecondary']) ?></span><span aria-hidden="true" class="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ===== Stats ===== -->
    <section aria-label="Facts" class="border-y border-white/5 bg-ink-soft/40">
      <div class="mx-auto grid max-w-[1400px] grid-cols-2 gap-10 px-6 py-16 lg:grid-cols-4 lg:px-10">
        <?php foreach ($stats as $stat): ?>
          <div class="flex flex-col gap-3 border-l hairline-gold pl-6">
            <div data-counter="<?= (int) $stat['value'] ?>" class="flex flex-col gap-2">
              <span class="font-serif text-4xl tracking-wide text-paper md:text-5xl"><span data-counter-num>0</span><span class="text-gold"><?= h($stat['suffix']) ?></span></span>
              <span class="eyebrow"><?= h($stat['label']) ?></span>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- ===== Press Marquee ===== -->
    <div class="group relative overflow-hidden border-y border-white/5 py-6" style="mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)">
      <div class="flex w-max animate-marquee group-hover:[animation-play-state:paused]" style="animation-duration: 46s">
        <?php for ($rep = 0; $rep < 2; $rep++): ?>
          <div <?= $rep === 1 ? 'aria-hidden="true"' : '' ?> class="flex shrink-0 items-center gap-10 pr-10">
            <?php foreach ($press as $claim): ?>
              <span class="flex items-center gap-10 whitespace-nowrap font-serif text-xl italic tracking-wide text-paper-dim md:text-2xl">
                <?= h($claim) ?><span class="ml-10 inline-block h-1.5 w-1.5 rotate-45 bg-gold/60" aria-hidden="true"></span>
              </span>
            <?php endforeach; ?>
          </div>
        <?php endfor; ?>
      </div>
    </div>

    <!-- ===== Crown Collections ===== -->
    <section id="collections" class="relative py-28 md:py-36">
      <div aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"></div>
      <div class="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div class="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <header class="flex flex-col gap-4">
            <span class="eyebrow reveal">Our 2 Royal Collections</span>
            <h2 class="reveal font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper md:text-6xl" data-reveal-delay="2">The Crown Collections</h2>
            <p class="reveal max-w-md text-base text-paper-dim" data-reveal-delay="3">Two extraordinary micro-lots. One unrivaled origin.</p>
          </header>
          <div role="tablist" aria-label="Currency" data-currency-toggle class="flex border border-white/15">
            <?php foreach (['AED', 'USD', 'NPR'] as $c): ?>
              <button type="button" role="tab" data-currency="<?= $c ?>" class="px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-paper-dim transition-all duration-300"><?= $c ?></button>
            <?php endforeach; ?>
          </div>
        </div>

        <div class="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <?php
          $cards = [
              ['collection' => $ancestral, 'badge' => null, 'image' => $media['ancestral'], 'elevation' => $ancestral['elevation'], 'meta' => $ancestral['harvest'], 'metaLabel' => 'Harvest', 'cta' => $ancestral['cta'], 'ctaHref' => '#dubai', 'accent' => false],
              ['collection' => $civet, 'badge' => $civet['badge'], 'image' => $media['civet'], 'elevation' => $civet['elevation'], 'meta' => $civet['rarity'], 'metaLabel' => 'Rarity', 'cta' => $civet['cta'], 'ctaHref' => '#allocation', 'accent' => true],
          ];
          foreach ($cards as $c):
              $collection = $c['collection'];
              $borderCls = $c['accent'] ? 'border-gold/40 shadow-[0_0_60px_rgba(212,175,55,0.07)] lg:mt-10' : 'border-white/10 lg:mt-0';
          ?>
          <article class="group flex flex-col overflow-hidden border bg-ink-soft/60 transition-all duration-700 [transition-timing-function:var(--ease-lux)] <?= $borderCls ?>">
            <div class="relative h-72 overflow-hidden md:h-96">
              <img src="<?= h($c['image']) ?>" alt="<?= h($collection['name']) ?>" loading="lazy" class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-110" />
              <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink/20 to-transparent"></div>
              <?php if (!empty($c['badge'])): ?>
                <span class="absolute left-5 top-5 max-w-[85%] border border-gold/50 bg-ink/70 px-4 py-2 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-gold backdrop-blur-sm"><?= h($c['badge']) ?></span>
              <?php endif; ?>
              <h3 class="absolute bottom-5 left-5 right-5 font-display text-3xl font-medium text-paper md:text-4xl"><?= h($collection['name']) ?></h3>
            </div>
            <div class="flex flex-1 flex-col gap-6 p-6 md:p-8">
              <p class="eyebrow"><?= h($collection['tagline']) ?></p>
              <p class="text-sm leading-relaxed text-paper-dim"><?= h($collection['description']) ?></p>
              <div class="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
                <?php foreach ($collection['tasting'] as $t): ?>
                  <div class="bg-ink-soft p-5 transition-colors duration-500 hover:bg-ink-lift">
                    <span class="eyebrow !text-[0.6rem] text-gold-dim"><?= h($t['name']) ?></span>
                    <span class="mt-2 block font-serif text-xl italic leading-snug text-paper"><?= h($t['value']) ?></span>
                  </div>
                <?php endforeach; ?>
              </div>
              <dl class="space-y-2 border-l hairline-gold pl-4 text-sm">
                <div class="flex justify-between gap-4"><dt class="pt-1 text-[0.65rem] uppercase tracking-[0.18em] text-paper-faint">Elevation</dt><dd class="text-right text-paper-dim"><?= h($c['elevation']) ?></dd></div>
                <div class="flex justify-between gap-4"><dt class="pt-1 text-[0.65rem] uppercase tracking-[0.18em] text-paper-faint"><?= h($c['metaLabel']) ?></dt><dd class="text-right text-paper-dim"><?= h($c['meta']) ?></dd></div>
              </dl>
              <ul class="flex flex-col gap-2">
                <?php foreach ($collection['tiers'] as $tier): ?>
                  <li class="flex items-center justify-between gap-4 border px-5 py-4 transition-colors duration-500 <?= !empty($tier['featured']) ? 'border-gold/40 bg-gold/[0.06]' : 'border-white/10 hover:border-gold/30' ?>">
                    <span class="text-sm text-paper-dim"><?= h($tier['label']) ?></span>
                    <span class="shrink-0 text-right" data-price data-price-aed="<?= (float) $tier['price']['AED'] ?>" data-price-usd="<?= (float) $tier['price']['USD'] ?>" data-price-npr="<?= (float) $tier['price']['NPR'] ?>">
                      <span data-price-amount class="font-display text-xl font-semibold text-gold">AED <?= number_format((float) $tier['price']['AED']) ?></span>
                      <?php if (!empty($tier['featured'])): ?><span class="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-dim">Most Allocated</span><?php endif; ?>
                    </span>
                  </li>
                <?php endforeach; ?>
              </ul>
              <a href="<?= h($c['ctaHref']) ?>" class="group/cta mt-auto inline-flex w-fit items-center gap-3 border-b border-gold/60 pb-1 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-gold transition-colors duration-500 hover:border-gold hover:text-paper">
                <?= h($c['cta']) ?><span aria-hidden="true" class="transition-transform duration-500 group-hover/cta:translate-x-1.5">→</span>
              </a>
            </div>
          </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <!-- ===== Craft ===== -->
    <?php
    $glyphs = ['M', '✋', '🔥', '◎'];
    $craftImages = [$media['craft']['terroir'], $media['craft']['handpick'], $media['craft']['firewood'], $media['craft']['jato']];
    $headlineParts = explode(' ', $craft['headline']);
    $firstWord = $headlineParts[0] ?? '';
    $restWords = implode(' ', array_slice($headlineParts, 1)) ?: $craft['headline'];
    $gallery = [
        ['image' => $media['craft']['terroir'], 'caption' => '1,700m Terroir'],
        ['image' => $media['craft']['handpick'], 'caption' => 'Handpicked by Master Elders'],
        ['image' => $media['craft']['firewood'], 'caption' => 'Himalayan Sun Drying'],
        ['image' => $media['craft']['jato'], 'caption' => 'Firewood Roasting'],
        ['image' => $media['craft']['jato'], 'caption' => 'Stone-Ground on Jato'],
        ['image' => $media['craft']['terroir'], 'caption' => 'Stone-Ground Powder'],
    ];
    ?>
    <section id="craft" class="relative border-t border-white/5 bg-ink-soft/30 py-28 md:py-36">
      <div class="mx-auto max-w-[1400px] px-6 lg:px-10">
        <header class="flex flex-col items-center gap-4 text-center">
          <span class="eyebrow">The Ancestral Craft & Terroir</span>
          <h2 class="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper md:text-6xl"><?= h($firstWord) ?> <span class="gold-text"><?= h($restWords) ?></span></h2>
          <p class="max-w-2xl text-base leading-relaxed text-paper-dim md:text-lg"><?= h($craft['intro']) ?></p>
        </header>
        <p class="mt-6 text-center font-serif text-xl italic text-gold"><?= h($craft['subheadline']) ?></p>

        <div class="mt-16 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <?php foreach ($craft['pillars'] as $i => $p): $glyph = $glyphs[$i] ?? '◎'; ?>
            <article class="group relative flex flex-col overflow-hidden bg-ink">
              <div class="relative h-56 overflow-hidden">
                <img src="<?= h($craftImages[$i % count($craftImages)]) ?>" alt="<?= h($p['title']) ?>" loading="lazy" class="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-[1600ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-110 group-hover:opacity-90" />
                <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent"></div>
                <span class="absolute left-4 top-4 font-serif text-3xl text-gold/80"><?= $glyph ?></span>
              </div>
              <div class="flex flex-1 flex-col gap-3 p-6">
                <h3 class="font-display text-xl font-medium leading-snug text-paper"><?= sprintf('%02d', $i + 1) ?>. <?= h($p['title']) ?></h3>
                <p class="text-sm leading-relaxed text-paper-dim"><?= h($p['text']) ?></p>
                <span aria-hidden="true" class="mt-auto h-px w-0 bg-gold transition-all duration-700 [transition-timing-function:var(--ease-lux)] group-hover:w-full"></span>
              </div>
            </article>
          <?php endforeach; ?>
        </div>

        <figure class="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <blockquote class="flex flex-col gap-6">
            <span class="eyebrow text-gold">10 Months of Himalayan Patience</span>
            <p class="font-display text-4xl font-medium leading-tight text-paper md:text-5xl"><?= h($craft['patience']['big']) ?> <span class="italic text-paper-dim"><?= h($craft['patience']['title']) ?></span></p>
            <p class="max-w-xl text-base leading-relaxed text-paper-dim"><?= h($craft['patience']['text']) ?></p>
          </blockquote>
          <div class="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <?php foreach ($gallery as $g): ?>
              <figure class="group relative h-80 w-64 shrink-0 overflow-hidden">
                <img src="<?= h($g['image']) ?>" alt="<?= h($g['caption']) ?>" loading="lazy" class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-110" />
                <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent"></div>
                <figcaption class="absolute bottom-4 left-4 right-4 font-serif text-lg italic text-paper"><?= h($g['caption']) ?></figcaption>
              </figure>
            <?php endforeach; ?>
          </div>
        </figure>
      </div>
    </section>

    <!-- ===== Packaging ===== -->
    <?php
    $pkgWords = explode(' ', $packaging['headline']);
    $pkgLast = array_pop($pkgWords);
    $pkgMain = implode(' ', $pkgWords);
    $bullets = ['CO₂-Neutral Biodegradable Pouch', '90% Wild Lokta Paper — Banknote-Grade', '10% Upcycled Kaskikot Coffee Remnants', 'Hand-Stamped Royal Wax Seal'];
    ?>
    <section id="packaging" class="relative py-28 md:py-36">
      <div class="mx-auto grid max-w-[1400px] items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div class="relative">
          <div class="relative aspect-[4/5] overflow-hidden">
            <img src="<?= h($media['packaging']) ?>" alt="Handcrafted Royal Box in 90% wild Lokta paper with Royal Wax Seal" loading="lazy" class="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"></div>
            <div class="absolute inset-4 border hairline-gold" aria-hidden="true"></div>
          </div>
          <div aria-hidden="true" class="absolute -bottom-8 -right-4 flex h-28 w-28 items-center justify-center rounded-full border border-gold/40 bg-ink shadow-[0_0_50px_rgba(212,175,55,0.15)] md:-right-8 md:h-36 md:w-36">
            <svg viewBox="0 0 100 100" class="h-3/5 w-3/5 -rotate-6">
              <circle cx="50" cy="50" r="47" fill="none" stroke="#8E1F22" stroke-width="2.5" opacity="0.7"></circle>
              <circle cx="50" cy="50" r="41" fill="#8E1F22" opacity="0.12"></circle>
              <text x="50" y="58" text-anchor="middle" font-size="17" letter-spacing="2" font-family="Playfair Display, serif" fill="#B94A4E">HR</text>
            </svg>
          </div>
        </div>
        <div class="flex flex-col gap-8">
          <header class="flex flex-col items-start gap-4 text-left">
            <span class="eyebrow">Eco-Luxury Packaging Commitment</span>
            <h2 class="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper md:text-6xl"><?= h($pkgMain) ?> <span class="italic text-gold"><?= h($pkgLast) ?></span></h2>
            <p class="max-w-2xl text-base leading-relaxed text-paper-dim md:text-lg"><?= h($packaging['intro']) ?></p>
          </header>
          <p class="lokta-texture max-w-xl border border-white/10 p-6 text-sm leading-relaxed text-paper-dim"><?= h($packaging['box']) ?></p>
          <ul class="grid gap-3 sm:grid-cols-2">
            <?php foreach ($bullets as $item): ?>
              <li class="flex items-center gap-3 border border-white/10 px-4 py-3 text-sm text-paper-dim"><span class="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden="true"></span> <?= h($item) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>
    </section>

    <!-- ===== Dubai ===== -->
    <section id="dubai" class="relative overflow-hidden border-t border-white/5 py-28 md:py-36">
      <div class="absolute inset-0">
        <img src="<?= h($media['burj']) ?>" alt="Dubai skyline at dusk" loading="lazy" class="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink"></div>
      </div>
      <div class="relative mx-auto grid max-w-[1400px] items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div class="flex flex-col gap-8">
          <span class="eyebrow text-gold">The Dubai Exclusive Destination</span>
          <h2 class="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper md:text-6xl"><?= h($dubai['headline']) ?></h2>
          <p class="max-w-xl text-lg leading-relaxed text-paper-dim"><?= h($dubai['subheadline']) ?></p>
          <p class="max-w-xl text-base leading-relaxed text-paper-dim"><?= h($dubai['text']) ?></p>
          <div class="flex flex-col gap-3 border border-white/10 bg-ink/60 p-6 backdrop-blur-sm">
            <span class="eyebrow !text-[0.6rem] text-gold-dim">Location</span>
            <p class="font-serif text-xl italic text-paper"><?= h($dubai['location']) ?></p>
            <a href="<?= h($dubai['mapUrl']) ?>" target="_blank" rel="noopener noreferrer" class="inline-flex w-fit items-center gap-2 border-b border-gold/60 pb-1 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-gold transition-colors duration-500 hover:border-gold hover:text-paper">View on Map →</a>
          </div>
          <a href="#allocation" class="group inline-flex w-fit items-center justify-center gap-3 border border-white/25 px-8 py-4 text-[0.8rem] font-medium uppercase tracking-[0.22em] text-paper transition-all duration-500 [transition-timing-function:var(--ease-lux)] hover:border-gold hover:text-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.12)]">
            <span>Reserve Your Visit</span><span aria-hidden="true" class="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
          </a>
        </div>
        <div class="relative hidden aspect-[4/5] overflow-hidden lg:block">
          <img src="<?= h($media['burj']) ?>" alt="Burj Khalifa, the world's tallest building" loading="lazy" class="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent"></div>
          <div class="absolute bottom-8 left-8 right-8 border border-white/10 bg-ink/70 p-6 backdrop-blur-md">
            <span class="font-display text-3xl font-medium text-gold">442m</span>
            <p class="mt-1 text-sm text-paper-dim">Level 122 — the world's highest lounge, where Himalayan Reserve is served.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section id="faq" class="relative border-t border-white/5 py-28 md:py-36">
      <div class="mx-auto max-w-[900px] px-6 lg:px-10">
        <header class="mb-14 flex flex-col items-center gap-4 text-center">
          <span class="eyebrow text-gold">Frequently Asked</span>
          <h2 class="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper md:text-5xl"><?= h($faq['headline']) ?></h2>
          <p class="max-w-xl text-base leading-relaxed text-paper-dim"><?= h($faq['subheadline']) ?></p>
        </header>
        <div class="flex flex-col gap-3">
          <?php foreach ($faq['items'] as $item): ?>
            <details class="group border border-white/10 bg-ink-soft/40 px-6 py-5 open:border-gold/30">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-display text-lg text-paper marker:content-none">
                <?= h($item['question']) ?>
                <span aria-hidden="true" class="shrink-0 text-xl text-gold transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p class="mt-4 text-sm leading-relaxed text-paper-dim"><?= h($item['answer']) ?></p>
            </details>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <!-- ===== Allocation Form ===== -->
    <?php $field = "w-full border border-white/15 bg-ink/60 px-4 py-3.5 text-sm text-paper placeholder:text-paper-faint transition-colors duration-400 focus:border-gold focus:outline-none"; ?>
    <section id="allocation" class="relative border-t border-white/5 bg-ink-soft/30 py-28 md:py-36">
      <div aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"></div>
      <div class="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:px-10">
        <div class="flex flex-col gap-8">
          <header class="flex flex-col items-start gap-4 text-left">
            <span class="eyebrow">VIP Private Allocation</span>
            <h2 class="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper md:text-6xl">Request <span class="gold-text">Private Allocation</span></h2>
            <p class="max-w-2xl text-base leading-relaxed text-paper-dim md:text-lg">For Royal Families, VIP Private Collectors & Corporate Gifting.</p>
          </header>
          <p class="max-w-md text-sm leading-relaxed text-paper-dim">Due to extremely limited annual yields, private allocations of Himalayan Reserve (Batch 2026) are subject to availability.</p>
          <ul class="flex flex-col gap-3 text-sm text-paper-dim">
            <li class="flex items-center gap-3"><span aria-hidden="true" class="h-1.5 w-1.5 rotate-45 bg-gold"></span> 3,100 boxes worldwide — Batch 2026</li>
            <li class="flex items-center gap-3"><span aria-hidden="true" class="h-1.5 w-1.5 rotate-45 bg-gold"></span> Strictly allocated via VIP waitlist</li>
            <li class="flex items-center gap-3"><span aria-hidden="true" class="h-1.5 w-1.5 rotate-45 bg-gold"></span> Sold nowhere else on Earth</li>
          </ul>
        </div>

        <form novalidate data-allocation-form data-whatsapp="<?= h($footer['whatsapp']) ?>" data-email="<?= h($footer['email']) ?>" class="flex flex-col gap-5 border border-white/10 bg-ink/70 p-6 backdrop-blur-sm md:p-10">
          <div class="grid gap-5 sm:grid-cols-2">
            <div class="flex flex-col gap-2"><label for="fullName" class="eyebrow !text-[0.6rem] text-gold-dim">Full Name *</label><input id="fullName" name="fullName" class="<?= $field ?>" placeholder="Your full name" /><span data-error-for="fullName" class="text-xs text-seal"></span></div>
            <div class="flex flex-col gap-2"><label for="email" class="eyebrow !text-[0.6rem] text-gold-dim">Email Address *</label><input id="email" name="email" type="email" class="<?= $field ?>" placeholder="you@example.com" /><span data-error-for="email" class="text-xs text-seal"></span></div>
            <div class="flex flex-col gap-2"><label for="phone" class="eyebrow !text-[0.6rem] text-gold-dim">Phone / WhatsApp *</label><input id="phone" name="phone" type="tel" class="<?= $field ?>" placeholder="+977 98…" /><span data-error-for="phone" class="text-xs text-seal"></span></div>
            <div class="flex flex-col gap-2"><label for="countryCity" class="eyebrow !text-[0.6rem] text-gold-dim">Country / City *</label><input id="countryCity" name="countryCity" class="<?= $field ?>" placeholder="Country, City" /><span data-error-for="countryCity" class="text-xs text-seal"></span></div>
          </div>
          <div class="flex flex-col gap-2">
            <label for="inquiryType" class="eyebrow !text-[0.6rem] text-gold-dim">Inquiry Type *</label>
            <select id="inquiryType" name="inquiryType" class="<?= $field ?> text-paper-faint">
              <option value="" disabled selected>Select inquiry type…</option>
              <?php foreach ($inquiryTypes as $t): ?><option value="<?= h($t['value']) ?>" class="bg-ink text-paper"><?= h($t['label']) ?></option><?php endforeach; ?>
            </select>
            <span data-error-for="inquiryType" class="text-xs text-seal"></span>
          </div>
          <div class="flex flex-col gap-2"><label for="message" class="eyebrow !text-[0.6rem] text-gold-dim">Message</label><textarea id="message" name="message" rows="5" class="<?= $field ?>" placeholder="Tell us about your collection…"></textarea></div>
          <div class="hidden" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off" /></div>
          <p role="alert" data-server-msg class="text-sm text-seal"></p>
          <div class="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="submit" class="inline-flex flex-1 items-center justify-center bg-gold px-8 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ink transition-all duration-500 hover:bg-paper disabled:opacity-60">Submit VIP Inquiry</button>
            <button type="button" data-channel="whatsapp" class="inline-flex flex-1 items-center justify-center border border-white/25 px-8 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-paper transition-all duration-500 hover:border-gold hover:text-gold disabled:opacity-60">Send via WhatsApp</button>
            <button type="button" data-channel="mailto" class="inline-flex flex-1 items-center justify-center border border-white/25 px-8 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-paper transition-all duration-500 hover:border-gold hover:text-gold disabled:opacity-60">Send via Email</button>
          </div>
          <p data-done-msg class="hidden gap-4 border border-gold/40 bg-gold/[0.06] px-5 py-4 text-sm text-gold">
            <svg viewBox="0 0 100 100" class="h-10 w-10 -rotate-6 [animation:stamp_0.55s_var(--ease-lux)_both]" aria-hidden="true">
              <circle cx="50" cy="50" r="47" fill="none" stroke="#8E1F22" stroke-width="3" opacity="0.8"></circle>
              <circle cx="50" cy="50" r="40" fill="#8E1F22" opacity="0.15"></circle>
              <text x="50" y="60" text-anchor="middle" font-size="20" font-family="Playfair Display, serif" fill="#B94A4E">HR</text>
            </svg>
            Request received. Our allocation desk will contact you shortly.
          </p>
        </form>
      </div>
    </section>
  </main>

  <!-- ===== Footer ===== -->
  <footer class="relative border-t hairline-gold bg-ink-soft/40">
    <div class="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
      <div class="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div class="flex flex-col gap-5">
          <a href="#home" class="font-display text-xl font-semibold tracking-[0.32em] text-paper">HIMALAYAN <span class="gold-text">RESERVE</span></a>
          <p class="max-w-sm font-serif text-lg italic leading-relaxed text-paper-dim"><?= h($footer['tagline']) ?></p>
          <p class="max-w-sm text-xs leading-relaxed tracking-wide text-paper-faint"><?= h($footer['footline']) ?></p>
        </div>
        <nav aria-label="Footer" class="flex flex-col gap-3">
          <span class="eyebrow !text-[0.6rem] text-gold-dim">Explore</span>
          <?php foreach ($nav as $item): ?><a href="#<?= h($item['id']) ?>" class="w-fit text-sm text-paper-dim transition-colors duration-300 hover:text-gold"><?= h($item['label']) ?></a><?php endforeach; ?>
        </nav>
        <div class="flex flex-col gap-3">
          <span class="eyebrow !text-[0.6rem] text-gold-dim">Nepal Estate</span>
          <p class="text-sm leading-relaxed text-paper-dim"><?= h($footer['nepalEstate']) ?></p>
          <span class="eyebrow mt-4 !text-[0.6rem] text-gold-dim">Dubai Partner</span>
          <p class="text-sm leading-relaxed text-paper-dim"><?= h($footer['dubaiPartner']) ?></p>
        </div>
        <div class="flex flex-col gap-3">
          <span class="eyebrow !text-[0.6rem] text-gold-dim">Contact</span>
          <a href="mailto:<?= h($footer['email']) ?>" class="w-fit text-sm text-paper-dim transition-colors duration-300 hover:text-gold"><?= h($footer['email']) ?></a>
          <a href="https://wa.me/<?= h(preg_replace('/\D/', '', $footer['whatsapp'])) ?>" target="_blank" rel="noopener noreferrer" class="w-fit text-sm text-paper-dim transition-colors duration-300 hover:text-gold">WhatsApp Concierge</a>
          <a href="#allocation" class="mt-2 w-fit border border-gold/60 px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-gold transition-all duration-500 hover:bg-gold hover:text-ink">Apply for Allocation</a>
        </div>
      </div>
      <div class="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
        <p class="text-xs text-paper-faint"><?= h($footer['copyright']) ?></p>
        <p class="text-xs text-paper-faint"><?= h($footer['legalName']) ?></p>
        <button type="button" id="back-to-top" aria-label="Back to top" class="group flex items-center gap-3 border border-white/15 px-5 py-3 text-[0.65rem] uppercase tracking-[0.24em] text-paper-dim opacity-60 transition-all duration-500 hover:border-gold hover:text-gold">
          Top<span aria-hidden="true" class="transition-transform duration-500 group-hover:-translate-y-1">↑</span>
        </button>
      </div>
    </div>
  </footer>

  <script src="<?= htmlspecialchars(hr_asset_url('assets/site.js')) ?>"></script>
  <script src="<?= htmlspecialchars(hr_asset_url('assets/chat-widget.js')) ?>"></script>
</body>
</html>
