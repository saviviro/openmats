# Source monitoring playbook

This document turns source discovery into a repeatable maintenance task. Routine
checks start from `data/source-registry.json`; they do not repeat an unrestricted
web search every week.

## Cadence

- **Weekly light check:** inspect priority-one schedules, dated calendars and
  visitor-policy pages for sources that currently have publishable events or
  time-bounded candidates.
- **Season-boundary check:** review every seasonal timetable when summer,
  autumn, Christmas or spring schedules are published. Expire old candidates;
  never extend them by assumption.
- **Monthly broad discovery:** search official websites and current official
  social channels for new or renamed Gi/BJJ and No-gi/submission-wrestling venues
  in Helsinki, Espoo, Vantaa and Kauniainen.
- **Before publishing a dated event:** check date-specific cancellations,
  holidays, competitions and access conditions again.

## Scheduled Codex checks

Five local Codex tasks provide several chances for a due check to start while
the computer and Codex app are running. Three weekly triggers share one routine
check interval of 168 hours. Two monthly triggers share one broad-discovery
interval of 28 days. A trigger is only an opportunity to start: it does not
repeat a check that is not yet due.

`data/automation-state.json` is the sole source of truth for the last fully
successful routine and discovery runs. The tasks must not infer success from an
individual event's `verifiedAt` or a venue's `checkedAt`, because a partial
source check can update those fields without completing the full run.

Before any network access, a scheduled task must:

1. verify that the local checkout is a clean `main` branch;
2. acquire the shared ignored `.automation-run.lock` with
   `node scripts/automation-gate.mjs acquire <routine|discovery>`;
3. fast-forward the clean local `main` from `origin/main` and stop if the
   branches have diverged;
4. stop when any open PR title begins with `chore: scheduled source`;
5. read the deterministic due status with
   `node scripts/automation-gate.mjs status <routine|discovery>`.

The lock is shared by routine and discovery tasks and must be released on every
exit path with
`node scripts/automation-gate.mjs release <routine|discovery>`. A due run works
on a uniquely timestamped `codex/scheduled-source-...` branch and opens a PR;
it never merges itself. Only a fully completed check may update the successful
timestamp, using `node scripts/automation-gate.mjs record <task> <summary>`.
Permission, source-access or validation failures must be reported without
advancing that timestamp.

A lock older than eight hours is reported as stale, but the script does not
replace it automatically: automatic replacement could race with a slow run.
Remove a stale `.automation-run.lock` manually only after confirming from the
Scheduled view that no source-check task is still active.

These are local scheduled tasks. The computer must be awake and the Codex app
running for a trigger to execute. If the computer is asleep, a later one of the
staggered triggers can run the still-due check. The first due run should be
reviewed manually from the Scheduled view before relying on the cadence.

## Check order

For each venue, use this order:

1. dated official calendar or event post;
2. current seasonal or weekly schedule;
3. official visitor and pricing policy;
4. official news and public social announcements;
5. broad web discovery only when the maintained sources do not answer the
   question.

An `open mat` label does not by itself prove access for visitors from other
clubs. Record exact times even when access is unresolved, but keep those entries
out of published event data.

## High-yield official sources

| Organization            | What to monitor                                                       | Official source                                                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Art of Ground Games     | Dynamic location schedule and session-specific restrictions           | [Erottaja booking](https://erottaja.artofgroundgames.com/book), [Sörnäinen booking](https://sornainen.artofgroundgames.com/book), [Kivenlahti booking](https://kivenlahti.gymdesk.com/book), [open mat information](https://www.artofgroundgames.com/classes/open-mat) |
| GB Gym                  | Exact monthly dates, cancellations and seasonal recurring slots       | [Calendar](https://www.gbgym.com/kalenteri/), [summer schedule](https://www.gbgym.com/kesaaikataulu/)                                                                                                                                                                  |
| Combat Academy          | Seasonal validity and the preliminary autumn schedule                 | [Training schedule](https://www.combat.fi/harjoitusajat/)                                                                                                                                                                                                              |
| HIPKO                   | Location-specific PDFs, member-only labels and separate public events | [Schedules](https://www.hipko.fi/harjoitusajat/), [locations](https://www.hipko.fi/salit/)                                                                                                                                                                             |
| Helsingin Ju-jutsuklubi | Saturday slot and space-occupying exceptions                          | [BJJ training times](https://ju-jutsuklubi.fi/brasilialainen-ju-jutsu/harjoitukset/)                                                                                                                                                                                   |
| Tundra Jiu-Jitsu        | Seasonal slot, price and summer confirmation requirement              | [Schedule](https://tundrajiujitsu.fi/harjoitusajat/), [prices](https://tundrajiujitsu.fi/hinnasto/)                                                                                                                                                                    |
| MMA Vantaa              | Seasonal validity, visitor wording and door-access instruction        | [Training schedule](https://www.mmavantaa.net/harjoitusajat-2/)                                                                                                                                                                                                        |
| Buli Jiu-Jitsu          | Urhea occurrence dates, annual membership and contact rule            | [Dated calendar](https://bulijj.fi/schedule), [membership](https://bulijj.fi/signup?membership=11121&type=2), [pricing](https://bulijj.fi/pricing)                                                                                                                     |
| Loop Martial Arts       | Saturday slot, seasonal end date and replacement timetable            | [Finnish calendar](https://www.loopmartialarts.fi/kalenteri), [English calendar](https://www.loopmartialarts.fi/en/kalenteri)                                                                                                                                          |
| Dojo Helsinki           | Weekly time, holidays and outside-club eligibility                    | [Training times](https://www.dojohelsinki.fi/treeniajat/)                                                                                                                                                                                                              |
| FireBody                | Weekly schedule, seasonal heading and access wording                  | [Schedule](https://www.firebody.fi/viikkoaikataulu.html)                                                                                                                                                                                                               |
| Savate Club             | Konala seasonal free-practice slots and visitor access                | [Konala summer schedule](https://www.savate.com/jatkokurssit/bjj/kesaharjoitusajat_konala.php)                                                                                                                                                                         |
| Salini Sports Center    | Weekly sparring and separately announced public events                | [Schedule](https://www.salini.fi/tuntiohjelma/)                                                                                                                                                                                                                        |

The full maintained list, including sources where no current open mat was found,
remains in `data/source-registry.json`.

## Discovery review: 14 July 2026

The metropolitan-area review checked Finnish- and English-language official
results for BJJ, no-gi and submission-wrestling venues and open mats. It found
no additional active in-scope venue beyond the existing registry baseline.

The review did add or refine evidence for existing venues:

- GB Gym has exact calendar entries on 30 August, 27 September, 25 October and
  27 December 2026. The project owner confirmed on 14 July 2026 that they are
  free, open to all practitioners and allow gi or no-gi. The 29 November entry
  is explicitly cancelled and remains unpublished. No dated July open mat is
  listed.
- Combat Academy's preliminary 17 August–19 December timetable has a Friday
  17:30–19:00 open mat, with outside-club access still unconfirmed.
- HIPKO Metsälä's 15 June–9 August PDF has Saturday and Sunday BJJ open mats at
  15:00–17:00, with outside-club access still unconfirmed.
- Loop Martial Arts' current summer candidate is bounded to 1 June–2 August.
  The project owner later confirmed on 16 July that the Saturday open mat is
  free, open to outside-club practitioners and allows Gi or No-gi.
- Art of Ground Games explicitly welcomes visitors generally, but its dynamic
  schedule can impose session-specific member or belt restrictions.

Discovery results in Kirkkonummi, Vihti and other neighboring municipalities
were excluded because they are outside the current four-city scope. General
wrestling open mats were excluded when the official source did not identify BJJ,
no-gi or submission wrestling.

## Vantaa follow-up: 16 July 2026

The focused Vantaa review produced one publishable series:

- MMA Vantaa's live page now clearly combines the 1 June–9 August summer heading
  with Sunday 12:00–13:30. It explicitly welcomes outside-club visitors and
  instructs them to be at the door before the start. The previous inconsistent
  rendering is gone, so four Sundays through 9 August are published.
- Combat Academy's official schedule places its open mat in Sörnäinen,
  Helsinki, not at the Myyrmäki venue.
- Salini's official schedule includes Saturday BJJ sparring in Rekola but does
  not call it a public open mat or confirm access for other clubs.
- No current official public open mat was verified for Vantaan
  Kamppailukeskus.

Vantaa remains visible in the website filter and in active monitoring.
Kauniainen remains in geographic discovery coverage, but is omitted from the
visible website city list while no active venue or open mat is known there.

## Publication audit: 16 July 2026

Every venue marked `ready` or `manual_review` was checked against its maintained
official sources. The audit changed publication data only where the source was
specific enough:

- AOGG Erottaja's Gymdesk calendar has a public Sunday 12:00–14:00 No-gi open
  mat. AOGG Sörnäinen has a Saturday 12:00–14:00 No-gi open mat for coloured
  belts. The general visitor policy, 15-euro drop-in price and booking rule
  apply. Kivenlahti's current open mats are explicitly for members and remain
  unpublished.
- MMA Vantaa's time conflict was resolved as described above and its current
  summer Sundays were published.
- Loop's official summer calendar still lists Saturday 10:30–12:00 through 2
  August, and its English calendar identifies the slot as BJJ/No-Gi. The
  project owner's access and price confirmation makes the three remaining
  summer Saturdays publishable; the series is not extended into autumn.
- Helsingin Ju-jutsuklubi, Tundra and GB Gym still match their published data.
  GB Gym's November cancellation remains excluded.
- Buli Urhea remains blocked because its recurring membership description has
  no matching dated occurrence in the official calendar.
- HIPKO, Combat Academy, Dojo Helsinki, FireBody, Savate Club and Salini
  still lack a source-specific confirmation that the relevant recurring slot is
  open to visitors, or otherwise have unresolved seasonal validity. Their
  candidates remain unpublished.
- Crest Center and Orion's Belt still have no verified public open mat in their
  official schedules.

The FireBody record was corrected during this audit: the official page currently
lists Saturday BJJ self-practice at 12:00–13:00 under a spring 2026 heading. The
previous 13:00–14:00 autumn candidate was not supported by the live source.

## Buli follow-up: 16 July 2026

The previous source-registry candidate was incorrectly attached to Buli
Konepaja. The current official membership flow explicitly names `URHEA | Open
Mat: GI & NOGI`, Sundays at 12:00, and the pricing page gives the end time as
13:30 and the annual open-mat membership price as 25 euros. The visitor page
requires advance contact for visitors and pre-membership trials.

The dynamic official calendar was checked week by week from 19 July through 20
September. It did not list a single Urhea open mat. Konepaja therefore has no
open-mat candidate, while Urhea retains a blocked recurring candidate. During
weekly checks, inspect the dated calendar first and publish only after an exact
Urhea occurrence appears.

## Recording a review

Update the registry's `discoveryReviewedAt` and `discoveryReviewNotes` after a
broad review. Update a venue's `checkedAt` only when its official evidence was
actually inspected. Use `datedOpenMats` for exact calendar entries, including
cancellations, and `candidateOpenMats` for recurring time-bounded slots.

Run `pnpm validate` after every registry change.
