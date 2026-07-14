# Open Mats Helsinki Region

Open Mats Helsinki Region is a planned public website that collects Brazilian
jiu-jitsu and submission-wrestling open mats across Helsinki, Espoo, Vantaa,
and Kauniainen.

The service will help visitors compare upcoming sessions by date, sport,
location, price, and participation requirements. Every published event must
retain a link to its original source and the time when the information was last
verified.

## Project status

The project is in its initial planning and setup phase. The first milestone is
a small, mobile-friendly static website backed by version-controlled event
data. A separate collection pipeline will be introduced after the event schema
and user interface are stable.

## Planned approach

- Astro and TypeScript for a statically generated website
- structured JSON or YAML event data before introducing a database
- a maintained registry of official gym and event sources
- deterministic collectors for routine source checks
- AI-assisted source discovery and conflict review where it adds value
- scheduled Codex tasks during the early phase
- optional OpenAI API integration later if cloud-only automation is needed
- Cloudflare hosting after the first local version is ready

## Geographic scope

The initial release covers the full Helsinki metropolitan area:

- Helsinki
- Espoo
- Vantaa
- Kauniainen

## Data principles

- Never invent missing event details.
- Prefer the organizer's own current source over secondary listings.
- Preserve source URLs and verification timestamps.
- Flag conflicting or uncertain information for review.
- Treat recurring schedules, holiday exceptions, and cancellations explicitly.
- Do not automatically remove verified events because one collection run fails.

See [AGENTS.md](AGENTS.md) for the current project conventions and operating
rules.

## Development

Development commands will be documented here when the web application is
scaffolded. Do not commit API keys, access tokens, or local environment files.

## License

No open-source license has been selected yet. Until a license is added, the
repository is publicly viewable but normal copyright restrictions apply.
