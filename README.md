# Open Mats Helsinki Region

Open Mats Helsinki Region is a planned public website that collects Gi (BJJ)
and No-gi (submission-wrestling) open mats across Helsinki, Espoo, Vantaa, and
Kauniainen.

The service will help visitors compare upcoming sessions by date, Gi/No-gi
format, location, price, and participation requirements. Every published event must
retain a link to its original source and the time when the information was last
verified.

## Project status

The first mobile-friendly static website is published at
[openmats.fi](https://openmats.fi). It contains a maintained
metropolitan-area source registry and an explicitly reviewed window of verified
real events. Recurring timetables are converted into dated events only through
an explicitly reviewed publication limit. The Finnish home page and the English
version at [/en/](https://openmats.fi/en/) use the same event data and can
be switched from the site header.

Contact details for event corrections and missing open mats are available on
the Finnish and English privacy and contact pages linked in the site footer.
Messages are reviewed against an official organizer source before event data
changes.

The site does not set cookies and does not use analytics, advertising or
marketing tracking. Finnish and English privacy notices explain the limited
processing performed by Cloudflare Pages and ordinary email correspondence
through Gmail. See [docs/privacy.md](docs/privacy.md) for the data map, retention
routine and the changes that require a new privacy and cookie review.

## Planned approach

- Astro and TypeScript for a statically generated website
- structured JSON or YAML event data before introducing a database
- a maintained registry of official gym and event sources
- deterministic collectors for routine source checks
- AI-assisted source discovery and conflict review where it adds value
- scheduled Codex tasks during the early phase
- optional OpenAI API integration later if cloud-only automation is needed
- automatic Cloudflare Pages deployment from the GitHub `main` branch

The local scheduled tasks share the deterministic timestamps in
`data/automation-state.json` and a short-lived run lock. This prevents the
staggered weekly and monthly triggers from duplicating work. See
[docs/source-monitoring.md](docs/source-monitoring.md) for the exact gate,
failure and review behavior. Because the tasks use the local project, the
computer must be awake and the Codex app running when a trigger starts.

## Geographic scope

The initial release covers the full Helsinki metropolitan area:

- Helsinki
- Espoo
- Vantaa
- Kauniainen

The visible city filters currently show Helsinki, Espoo and Vantaa. Kauniainen
stays in source discovery coverage but is omitted from the filter while no
active BJJ or No-gi venue or publishable open mat is known there.

## Data principles

- Never invent missing event details.
- Prefer the organizer's own current source over secondary listings.
- Preserve source URLs and verification timestamps.
- Represent event type directly as Gi, No-gi, both, or unknown; do not maintain
  a separate sport and attire distinction in published event data.
- Flag conflicting or uncertain information for review.
- Treat recurring schedules, holiday exceptions, and cancellations explicitly.
- Do not automatically remove verified events because one collection run fails.

See [AGENTS.md](AGENTS.md) for the current project conventions and operating
rules. See [docs/source-registry.md](docs/source-registry.md) for the first
official-source mapping and the distinction between an open-mat label and
confirmed outside-club access. See
[docs/source-monitoring.md](docs/source-monitoring.md) for the maintained
check order, cadence and high-yield official sources. See
[docs/event-publication.md](docs/event-publication.md) for the first dated-event
window, exception handling and a documented blocked source conflict. See
[docs/deployment.md](docs/deployment.md) for the production URL and Cloudflare
Pages deployment workflow.

## Development

Requirements:

- Node.js 22.12 or newer (Node 24 is recommended)
- pnpm 11.7

Install dependencies and start the local development server:

```sh
pnpm install
pnpm dev
```

Run all local quality checks:

```sh
pnpm validate
```

The validation command checks formatting, Astro and TypeScript diagnostics,
unit tests, content schemas, duplicate event identities, and the production
build. Do not commit API keys, access tokens, or local environment files.

## Project structure

```text
data/                  maintained source and recurring-event registries
docs/                  decisions and collection documentation
src/components/        reusable Astro interface components
src/data/              version-controlled event data
src/lib/               event formatting and validation utilities
src/pages/             website routes
src/styles/            global visual styles
.github/workflows/     continuous integration
scripts/               deterministic scheduled-task gate and tests
```

## License

No open-source license has been selected yet. Until a license is added, the
repository is publicly viewable but normal copyright restrictions apply.
