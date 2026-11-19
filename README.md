# fishermen-analytics.com

Website and CMS for Fishermen Analytics. Bilingual: English at `/`, Bahasa Malaysia at `/ms/`.

- **Next.js 16** (App Router) with **Payload CMS 3** running inside the same app
- **PostgreSQL** (Neon or Supabase), media on **Vercel Blob**, email via **Resend**, hosted on **Vercel**
- CMS at `/admin`

## Run it locally

Needs Node.js 22, 24 or 26. No database install needed: a local PostgreSQL 17 runs from `node_modules`.

```bash
npm install
cp .env.example .env   # then set PAYLOAD_SECRET
npm run dev:local      # starts the local database, then the site and CMS
```

Open http://localhost:3000 for the site and http://localhost:3000/admin to create the first user
(the first account is always an Admin).

- Local data lives in `.postgres/` (not committed). Delete that folder to start again from empty.
- `npm run db` starts only the database, e.g. to run `npm run dev` or migrations in another terminal.
- Locally, Payload updates the database tables automatically when collections change. Production
  uses migrations instead (below).

## Database changes and deploys

1. Change collections or fields, then check them locally with `npm run dev:local`.
2. Create a migration: `npm run payload migrate:create <name>` (with the local database running).
3. Commit the new file in `src/migrations/`.
4. On Vercel, set the build command to `npm run ci`: it applies migrations to the production
   database, then builds.

## CMS structure

| Area                | What it holds                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Pages               | Home, About, Awards, Careers, Contact and landing pages, built from blocks                 |
| Services            | The seven services, incl. the short label used by the homepage game                        |
| Case studies        | Client, services, challenge, what we did, results (percentages only), award, shared credit |
| Awards              | Show, category, result, credit. Client, year and level are internal only                   |
| Insights            | Articles with author, category and FAQ blocks                                              |
| Team, Clients, Jobs | About page, logo wall, Careers                                                             |
| Enquiries           | Forms and form submissions                                                                 |
| Site settings       | Address, contact details, socials, Fishermen Integrated link, GA4 and Search Console       |

Every content type has EN and BM fields. Untranslated BM fields fall back to English.

**Roles:** editors save drafts, publishers publish, admins also manage users and tracking settings.
Pages, services, case studies, insights and jobs have drafts, scheduled publishing and version history.

## Useful commands

| Command                          | Does                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `npm run dev:local`              | Start the local database, then the site and CMS               |
| `npm run db`                     | Start only the local database                                 |
| `npm run dev`                    | Start the site and CMS against `DATABASE_URL`                 |
| `npm run generate:types`         | Regenerate `src/payload-types.ts` after changing collections  |
| `npm run generate:importmap`     | Regenerate the admin import map after adding admin components |
| `npm run payload migrate:create` | Create a database migration                                   |
| `npm run payload migrate`        | Apply migrations                                              |
| `npm run build`                  | Production build                                              |
| `npm run ci`                     | Apply migrations, then build (Vercel build command)           |
| `npm run lint`                   | Lint                                                          |

## Accounts

Fishermen Analytics owns every account (domain, Vercel, database, Blob, Resend, GitHub, GA4,
Search Console). The team creates them and enters credentials in Vercel environment variables;
see `.env.example` for the list.
