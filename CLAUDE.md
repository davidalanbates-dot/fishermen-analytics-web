# Working in this repo

- Payload CMS skill: `.claude/skills/payload/SKILL.md` (reference docs in `.claude/skills/payload/reference/`).
- Brand assets, the clickable preview and draft copy originally live in the OneDrive folder
  `Company Docs/Claude Built Website`. Copies are here: `public/brand/`, `seed/client-logos/`,
  `seed/content/case-studies.md`, `docs/reference/preview.html` (content/structure reference, not production code).
- Code layout: collections in `src/collections/`, page blocks in `src/blocks/`, Site settings in `src/globals/`,
  roles and publishing rules in `src/access/roles.ts`, locale routing in `src/proxy.ts` + `src/i18n/config.ts`,
  public pages under `src/app/(frontend)/[locale]/`.
- Local dev: `npm run dev:local` (embedded Postgres on port 54320, data in `.postgres/`).
- After changing collections or fields: `npm run generate:types` and `npm run generate:importmap`.
- Database changes go through migrations: `npm run payload migrate:create` then `npm run payload migrate`.
- Content rules (percentages only, award display, Integrated credit) are enforced in the CMS where possible;
  keep them enforced when adding fields.

---

# Project brief

Build the new website for **Fishermen Analytics** at **fishermen-analytics.com**: a fast, bilingual (English and Bahasa Malaysia) site with a CMS the marketing team can edit without developers.

This brief carries over decisions made while planning in Claude chat. Treat them as agreed unless the user changes them.

- Full plan (living document): https://claude.ai/artifact/CjurShnTteW7NdjkKjjiy7 (main tab: plan; second tab: case study copy)
- Clickable preview of structure and content: https://claude.ai/artifact/Q5sp48neGhJeFMsUpWqt82
- Preview source: `preview/index.html` (single-file HTML, hash routing). Use it as the content and structure reference, not as production code.

## The company

- Independent digital marketing agency in Malaysia, founded **2014**. Legal name: Fishermen Analytics Sdn Bhd.
- Office: D-09-02, Level 9, SkyPark One City, Jalan USJ 25/1, 47650 Subang Jaya, Selangor (from a public directory; user to confirm). No Singapore office, but clients in Malaysia and Singapore.
- Sister agency: **Fishermen Integrated** (fishermen.co), known for big creative ideas. Analytics is the data-led one.
- Leadership (About page): David Alan Bates, Co-Founder & Managing Director · Mark Darren Lee, Co-Founder · Joyce Lee, Senior Manager, Content & Strategy. Photos and bios to come.

## Positioning

- "The data-led Fishermen": marketing and actionable insights from data and user behaviour.
- **Lead services:** Data Analytics, SEO/GEO Optimisation (marked "Our core").
- **Other services:** Creative Production, Video Production, Website Development, Social Media Management, Media Management, each framed as data-driven.
- Family line: "Part of the Fishermen family, alongside Fishermen Integrated." Integrated brings the big ideas; Analytics brings the insight, search visibility and measurable results.
- Never claim Integrated-only awards. Joint credit is labelled "with Fishermen Integrated".
- Method (from the credentials deck): Find the fish (insight) → Craft the hook (creative) → Reel in the results (analytics and optimisation).

## Content rules (agreed)

- **Case study results as percentages only.** No revenue, budgets, visit counts or other absolute client figures.
- **Awards:** shown as past wins ("Winner, Marketing Excellence Awards"), with **no level, no year and no client name**.
- **Bahasa Malaysia:** Claude drafts the BM copy after the English is signed off; the team edits it.
- The **homepage does most of the work**: positioning, all seven services, three featured case studies with numbers, awards, client logos, Fishermen Integrated link, enquiry form. Users should not need to navigate much.

## Sitemap

Home · Services (7, one page each or anchored sections) · Work (11 case studies, filter by service) · Case study pages · About · Awards · Insights (articles) · Careers · Contact. Every page in EN at the root and BM under `/ms/`.

## Case studies (11)

Full copy for the first four is in `content/case-studies.md`.

| Client | Project | Services | Headline result |
| --- | --- | --- | --- |
| Prince Court Medical Centre | Growing search in the AI Overview era (SEO/GEO showcase, no award) | SEO/GEO, Data Analytics | +14.9% organic sessions despite −11.9% branded search; +71.2% unbranded |
| KWC Fashion Wholesale | Bilingual fashion storytelling (Finalist, MEA Multilingual Marketing) | SEO/GEO, Creative | +26.5% organic traffic; AI Overview presence 0% → 20% |
| World Vision Malaysia | Sponsoring more children with SEO (Winner, MEA Search Marketing) | SEO/GEO, Data Analytics | +30% organic traffic; +24% child sponsorship revenue |
| Southern Valley (Farmbyte) | Raya Confirm Ong (Winner, MEA Specific Audience) | Creative, Video, Social, SEO | +43% sales revenue; +40% retail distribution |
| Taylor's University | SEO and lead generation | SEO/GEO | To add |
| PETRONAS | Corporate site, digital CI and CMS | Website Development | Bounce rate −4.5% in first month |
| PETRONAS | Integrated Report and FLOW Magazine sites | Website Development | Build and maintenance |
| Life Insurance Association of Malaysia | #BukanExtra 2.0 gamified site | Website Development | To add |
| Harvey Norman | Not Your Parents' Feed | Creative, Social | Organic search interest +49%; link clicks +88% |
| Harvey Norman | I Love Sabah store launch | Creative, Social | To add |
| Farmbyte | A not-so-corporate video | Video Production | To add |

Dropped as too old: INTI, Betadine, Nando's.

## Awards (display list)

Marketing Excellence Awards: Search Engine Marketing · Relationship Marketing · Multilingual Marketing · Specific Audience. MARKies Awards: Most Creative Social Media. Webby Awards: People's Voice, Best Use of Video or Moving Image (with Fishermen Integrated).

## Interactive services game (homepage)

- Compact panel (~320–340 px tall) inside the services section, beside a plain list of the seven services. Homepage only.
- Original arcade game (do not use the "Space Invaders" name or assets): a boat casts hooks up at drifting service blocks; each catch shows the service summary and a link; catch all seven → "Let's talk" CTA. ~30-second rounds; starts only on Play.
- Keyboard, mouse and touch; "Skip the game" link; respects reduced motion; lazy-loaded so it does not hurt page speed.
- Block labels come from the CMS Services collection (EN/BM). Track catches, completions and click-throughs in GA4.
- A working version is in `preview/index.html` (the `Game` module).

## Technology (agreed)

- **Next.js** (App Router) + **Payload CMS** (open source, runs inside the Next.js app; field-level localisation for `en` and `ms`).
- **PostgreSQL** (e.g. Neon or Supabase), media in cloud storage (e.g. Vercel Blob or Cloudflare R2), hosted on **Vercel**, domain fishermen-analytics.com.
- Forms: Payload form submissions plus an email service (e.g. Resend).
- GA4 and Google Search Console from launch. Not WordPress.
- Fishermen Analytics owns all accounts (domain, hosting, database). The team creates accounts and enters credentials themselves.
- Code repository: private repo on David's personal GitHub, github.com/davidalanbates-dot/fishermen-analytics-web (user's choice, Nov 2026; can be transferred to a company organisation later).

### CMS collections

Pages (flexible blocks) · Services · Case studies (client, services, industry, brief/challenge, what we did, results, media, award link, shared-credit flag) · Awards (show, category, credit; client stored but hidden) · Insights (articles with author, category, FAQ blocks) · Team · Clients (name, logo) · Jobs · Enquiries (form submissions) · Site settings (address, phone, email, socials, Fishermen Integrated link). Roles: editor, publisher, admin. Drafts, preview and version history.

### SEO / GEO requirements

The site is the agency's own SEO/GEO showcase: Core Web Vitals pass on mobile; structured data (Organization, Service, Article, FAQ, Person); hreflang for EN/BM; XML sitemaps; editable meta per page; llms.txt; content written for AI answers; key facts consistent across the site, fishermen.co, LinkedIn and directories.

## Design status

Not final. The user is iterating in the preview.

- Brand colours from the logo: yellow `#FFF200`, sky blue `#00A2E8`, black `#000000`, white. Use yellow as a highlight and for the header/hero band, not for large reading areas.
- Preview fonts: Zilla Slab (display) + Work Sans (body). Provisional.
- **Header:** navigation only, no logo. The official logo is used in the footer.
- **Homepage hero:** a dedicated branding area between the navigation and the headline "Marketing that starts with the data." is still to be designed.

## Assets in this folder

- `assets/brand/`: official logo (wide and square, yellow background).
- `assets/client-logos/`: 12 client logos. Notes: SD Guthrie file is white-only (need a colour or dark version); Gleneagles, Pantai and KWC are low resolution (ask client for larger); Paramount slogan already cropped; Ellgy Plus already trimmed.
- `content/case-studies.md`: approved-for-review case study copy.

## Open items

- Results for Taylor's, LIAM, Harvey Norman Sabah and Farmbyte.
- Client permission to publish results (logos are cleared).
- Email address, phone number, reply time for the enquiry form; confirm office address.
- Team photos and bios.
- Whether fishermen.co will link to fishermen-analytics.com.
- Design direction for the hero branding area.
