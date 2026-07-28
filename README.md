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
real events. Recurring timetables are converted into dated events through a
reviewed, rolling eight-week publication limit, while shorter seasonal
boundaries still take precedence. The Finnish home page and the English version
at [/en/](https://openmats.fi/en/) use the same event data and can be switched
from the site header. `https://openmats.fi` is the canonical production address;
`https://openmats.pages.dev` is only the underlying Cloudflare Pages project
hostname.

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
- version-controlled canonical JSON inputs before introducing a database
- a maintained registry of official gym and event sources
- deterministic collectors for routine source checks
- AI-assisted source discovery and conflict review where it adds value
- scheduled Codex tasks during the early phase
- optional OpenAI API integration later if cloud-only automation is needed
- automatic Cloudflare Pages deployment from the GitHub `main` branch

The local scheduled tasks run in isolated Git worktrees based on `origin/main`,
so the user's active branch and unfinished work do not block them. They share
the deterministic timestamps in `data/automation-state.json` and an
operating-system temporary run lock. Each run must retain the lock's unique
`ownerId` and use it when recording success and releasing the lock, so one run
cannot release another run's lock. This prevents the staggered weekly and
monthly triggers from duplicating work. GitHub preflight results distinguish an
actual missing or rejected credential from keyring, authorization, CLI and
network failures; only a missing credential or GitHub's explicit 401 response
calls for reauthentication. See
[docs/source-monitoring.md](docs/source-monitoring.md) for the exact gate,
failure and review behavior. The computer must still be awake and the Codex app
running when a trigger starts.

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
- pnpm 11.9

Install dependencies and start the local development server:

```sh
pnpm install
pnpm dev
```

Run all local quality checks:

```sh
pnpm validate
```

After reviewing recurring sources and their exceptions, rebuild the rolling
event window with:

```sh
pnpm events:refresh
```

The canonical publication inputs are `data/event-series.json`,
`data/event-templates.json` and `data/source-registry.json`.
`src/data/events.json` is generated from those inputs by `pnpm events:refresh`;
do not maintain it manually. `pnpm events:check`, which is part of
`pnpm validate`, rejects a generated file that no longer matches its canonical
inputs. The validation command also checks formatting, Astro and TypeScript
diagnostics, unit tests, content schemas, duplicate event identities, and the
production build.

After a merged production release, verify the exact Cloudflare deployment,
latest completed review and a sentinel occurrence near the rolling window's end:

```sh
pnpm automation:verify-production -- --commit <main-commit-sha>
```

Do not commit API keys, access tokens, or local environment files.

## Project structure

```text
data/                  canonical source, series and event-template inputs
docs/                  decisions and collection documentation
src/components/        reusable Astro interface components
src/data/              generated, version-controlled publication output
src/lib/               event formatting and validation utilities
src/pages/             website routes
src/styles/            global visual styles
.github/workflows/     continuous integration
scripts/               deterministic scheduled-task gate and tests
```

## License

No open-source license has been selected yet. Until a license is added, the
repository is publicly viewable but normal copyright restrictions apply.
