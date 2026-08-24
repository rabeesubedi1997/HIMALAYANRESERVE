<?php
declare(strict_types=1);

/**
 * Default site content — PHP port of astro-site/src/data/content.ts.
 * These are the fallback values shown when a section has no override yet
 * in the `site_settings` table (see inc/settings.php).
 */

function hr_content_defaults(): array
{
    return [
        'seo' => [
            'title' => "Himalayan Reserve — The World's Highest Handcrafted Himalayan Coffee",
            'description' => "Ancestral single-estate coffee from 1,700m in Kaskikot, Nepal. Firewood-roasted, stone-ground, and served exclusively at At.mosphere Lounge, Level 122, Burj Khalifa, Dubai.",
            'ogTitle' => "Himalayan Reserve — Ancestral Single-Estate Kaskikot (1,700m)",
            'ogDescription' => "From the Roof of the World to the Top of the Sky. The world's most expensive handcrafted Himalayan coffee. Served exclusively at Burj Khalifa, Level 122.",
            'keywords' => "himalayan coffee, nepal coffee, world most expensive coffee, civet coffee nepal, burj khalifa coffee, kaskikot coffee, stone ground coffee",
            'ogImage' => "/images/hero-poster.jpg",
            'noindex' => false,
        ],
        'hero' => [
            'eyebrow' => "Ancestral Single-Estate Kaskikot — Himalayan Range · 1,700m",
            'title' => "From the Roof of the World",
            'titleAccent' => "to the Top of the Sky.",
            'sub' => "Cultivated at 1,700 meters in the sacred Himalayas of Nepal. Handcrafted by ancestral hands, firewood-roasted, and stone-ground. Served exclusively at At.mosphere Lounge, Level 122, Burj Khalifa, Dubai.",
            'ctaPrimary' => "Explore Collections",
            'ctaSecondary' => "Burj Khalifa Experience",
        ],
        'stats' => [
            ['value' => 1700, 'suffix' => 'm', 'label' => 'Elevation — Kaskikot, Nepal'],
            ['value' => 10, 'suffix' => ' months', 'label' => 'Himalayan Maturation'],
            ['value' => 3100, 'suffix' => '', 'label' => 'Boxes Worldwide (Batch 2026)'],
            ['value' => 442, 'suffix' => 'm', 'label' => 'Above the Clouds — Burj Khalifa'],
        ],
        'ancestral' => [
            'name' => "Ancestral Single-Estate Edition",
            'badge' => "",
            'tagline' => "100% Handpicked, Firewood Roasted & Stone-Ground",
            'description' => "Cultivated at an elevation of 1,700 meters on our family estate in Kaskikot, Nepal, directly overlooking the Annapurna range, this coffee is cultivated without any chemicals or artificial interventions. It undergoes a meticulous drying process under the pristine Himalayan sun, followed by slow roasting over authentic firewood. The coffee is then ground using ancient stone mills known as Jato.",
            'tasting' => [
                ['name' => 'Flavour', 'value' => 'Wild Himalayan Honey'],
                ['name' => 'Notes', 'value' => 'Roasted Nut, Subtle Firewood Warmth'],
                ['name' => 'Finish', 'value' => 'Velvety Smooth'],
            ],
            'elevation' => "1,700 Meters (Kaskikot, Nepal)",
            'harvest' => "Limited Batch 2026 — 3,100 Boxes Worldwide",
            'cta' => "View Experience",
            'tiers' => [
                ['label' => '100g Royal Gift Box', 'price' => ['AED' => 149, 'USD' => 40, 'NPR' => 5300], 'featured' => false],
                ['label' => '250g Executive Master Box', 'price' => ['AED' => 399, 'USD' => 108, 'NPR' => 14300], 'featured' => false],
                ['label' => '1kg Barista Reserve (Bulk)', 'price' => ['AED' => 1200, 'USD' => 325, 'NPR' => 43000], 'featured' => true],
            ],
        ],
        'civet' => [
            'name' => "Wild Civet Reserve",
            'badge' => "World Record Holder — The World's Most Expensive & Rare Himalayan Coffee",
            'tagline' => "Harvested not by human hands, but selected by the wild.",
            'description' => "Harvested not by human hands, but selected by the wild, free-roaming Himalayan Civets of Kaskikot. As these creatures roam freely within our 1,700-meter forest gardens, we do not dictate production — Nature does. 100% Cruelty-Free, Forest-Sourced, and Unpredictable in Volume.",
            'tasting' => [
                ['name' => 'Notes', 'value' => 'Wild Jasmine, Caramelized Plum'],
                ['name' => 'Finish', 'value' => 'Dark Cocoa, Zero Bitterness'],
                ['name' => 'Aftertaste', 'value' => 'Infinite'],
            ],
            'elevation' => "1,700 Meters (Kaskikot Forest Estate)",
            'rarity' => "Ultra-Limited Annual Allocation — Waitlist Only",
            'cta' => "Apply for VIP Allocation",
            'tiers' => [
                ['label' => '100g Crown Box', 'price' => ['AED' => 999, 'USD' => 270, 'NPR' => 36000], 'featured' => false],
                ['label' => '250g Crown Box', 'price' => ['AED' => 1999, 'USD' => 545, 'NPR' => 72000], 'featured' => true],
                ['label' => '1 Cup Brewed — At.mosphere Lounge', 'price' => ['AED' => 500, 'USD' => 136, 'NPR' => 18000], 'featured' => false],
            ],
        ],
        'craft' => [
            'headline' => "Purity Beyond Science",
            'subheadline' => "No Lab Experiments. No Chemicals. Just Pure Himalayan Nature.",
            'intro' => "While modern coffee producers manipulate beans in oxygen-deprived tanks and chemical laboratories, we honor 100% pure Himalayan nature and ancestral wisdom.",
            'pillars' => [
                ['title' => '1,700m Himalayan Terroir', 'text' => 'Cultivated at the extreme ecological boundary of coffee cultivation, nourished by pure snowmelt water and mountain air. 100% pesticide-free and chemical-free.'],
                ['title' => 'Handpicked by Master Elders', 'text' => 'Only 100% deep-red, perfectly ripe cherries are selected one by one by our family elders in Kaskikot.'],
                ['title' => 'Authentic Firewood Roasting', 'text' => 'Slow-roasted over real firewood, imparting a signature, subtle smoky warmth that no electric machine can replicate.'],
                ['title' => 'Ancient Stone Grinding (Jato)', 'text' => 'Hand-milled on traditional stone grinders (Jato), preserving natural coffee oils without heat friction.'],
            ],
            'patience' => [
                'big' => "10 MONTHS",
                'title' => "Of Himalayan Patience",
                'text' => "Commercial coffees rush to ripen in 6 months under tropical heat, resulting in flat and bitter flavors. At 1,700m in Kaskikot, our mountain cherries mature at nature's slowest pace — taking a full 10 months under the cold Himalayan sun. This extended maturation allows the bean to absorb maximum natural sugars, organic acids, and rare mountain aromatics. Slow Maturation = Highest Natural Density & Sweetest Flavor.",
            ],
        ],
        'packaging' => [
            'headline' => "Sustainable Himalayan Elegance",
            'subheadline' => "Where Luxury Meets Eco-Consciousness",
            'intro' => "Indulge in a luxurious experience from the very first touch. Our coffee is cradled in CO2-neutral, biodegradable pouches, reflecting our commitment to environmental preservation.",
            'box' => "Our handcrafted Royal Box is custom-made in Nepal using 90% wild Lokta paper — the same durable fiber trusted by Japan to print banknotes — and 10% upcycled Kaskikot coffee remnants. Sealed with an authentic hand-stamped Royal Wax Seal. Every detail invites you into a world where Himalayan Elegance Meets Eco-Consciousness.",
        ],
        'dubai' => [
            'headline' => "A Singular Destination",
            'subheadline' => "Served Exclusively at At.mosphere Lounge, Level 122, Burj Khalifa, Dubai",
            'text' => "To preserve the absolute rarity of our harvest, Himalayan Reserve is not sold in retail stores or online anywhere on Earth. To savor the world's pinnacle of handcrafted coffee, visit the world's highest lounge — perched 442 meters above the clouds at Level 122 of Burj Khalifa, Dubai.",
            'location' => "At.mosphere Restaurant & Lounge, Level 122, Burj Khalifa, Downtown Dubai, UAE",
            'mapUrl' => "https://www.google.com/maps/search/?api=1&query=At.mosphere+Lounge+Level+122+Burj+Khalifa+Dubai",
        ],
        'press' => [
            "World's Most Expensive Coffee — \$2,200 per KG",
            "Nepal's Wild Civet Reserve Dethrones Black Ivory",
            "The Highest Altitude 100% Handcrafted & Stone-Ground Coffee on Earth",
            "Cultivated at 5,580ft Under the Shadow of 26,000ft+ Himalayan Peaks",
            "Served at 442m — The World's Highest Lounge",
        ],
        'nav' => [
            ['id' => 'collections', 'label' => 'Collections'],
            ['id' => 'craft', 'label' => 'Ancestral Craft'],
            ['id' => 'packaging', 'label' => 'Packaging'],
            ['id' => 'dubai', 'label' => 'Dubai'],
            ['id' => 'allocation', 'label' => 'Private Allocation'],
        ],
        'footer' => [
            'name' => "HIMALAYAN RESERVE",
            'legalName' => "Himalayan Reserve Coffee Pvt. Ltd.",
            'tagline' => "From the Roof of the World to the Top of the Sky.",
            'email' => "contact@himalayanreserve.coffee",
            'whatsapp' => "9779800000000",
            'nepalEstate' => "Kaskikot, Kaski, Annapurna Region, Nepal",
            'dubaiPartner' => "At.mosphere Lounge, Level 122, Burj Khalifa, Dubai, UAE",
            'copyright' => "© 2026 Himalayan Reserve Coffee Pvt. Ltd. All Rights Reserved.",
            'footline' => "100% Single-Estate Organic • Zero Chemicals • Handcrafted in Nepal.",
        ],
        'media' => [
            'heroVideo' => "/video/hero.mp4",
            'heroPoster' => "/images/hero-poster.jpg",
            'ancestral' => "/images/ancestral.jpg",
            'civet' => "/images/civet.jpg",
            'craft' => [
                'terroir' => "/images/craft-terroir.jpg",
                'handpick' => "/images/craft-handpick.jpg",
                'firewood' => "/images/craft-firewood.jpg",
                'jato' => "/images/craft-jato.jpg",
            ],
            'packaging' => "/images/lokta-box.jpg",
            'burj' => "/images/burj.jpg",
        ],
    ];
}

const HR_INQUIRY_TYPES = [
    ['value' => 'private_collection', 'label' => 'Private Collection'],
    ['value' => 'royal_gifting', 'label' => 'Royal Gifting'],
    ['value' => 'atmosphere_reservation', 'label' => 'At.mosphere Reservation Inquiry'],
];
