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
  social channels for new or renamed BJJ, no-gi and submission-wrestling venues
  in Helsinki, Espoo, Vantaa and Kauniainen.
- **Before publishing a dated event:** check date-specific cancellations,
  holidays, competitions and access conditions again.

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

| Organization            | What to monitor                                                       | Official source                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Art of Ground Games     | Dynamic location schedule and session-specific restrictions           | [Schedule](https://www.artofgroundgames.com/schedule), [open mat information](https://www.artofgroundgames.com/classes/open-mat)                      |
| GB Gym                  | Exact monthly dates, cancellations and seasonal recurring slots       | [Calendar](https://www.gbgym.com/kalenteri/), [summer schedule](https://www.gbgym.com/kesaaikataulu/)                                                 |
| Combat Academy          | Seasonal validity and the preliminary autumn schedule                 | [Training schedule](https://www.combat.fi/harjoitusajat/)                                                                                             |
| HIPKO                   | Location-specific PDFs, member-only labels and separate public events | [Schedules](https://www.hipko.fi/harjoitusajat/), [locations](https://www.hipko.fi/salit/)                                                            |
| Helsingin Ju-jutsuklubi | Saturday slot and space-occupying exceptions                          | [BJJ training times](https://ju-jutsuklubi.fi/brasilialainen-ju-jutsu/harjoitukset/)                                                                  |
| Tundra Jiu-Jitsu        | Seasonal slot, price and summer confirmation requirement              | [Schedule](https://tundrajiujitsu.fi/treenit/), [prices](https://tundrajiujitsu.fi/hinnasto/)                                                         |
| MMA Vantaa              | Current time conflict, visitor wording and exception calendar         | [Training schedule](https://www.mmavantaa.net/harjoitusajat-2/)                                                                                       |
| Buli Jiu-Jitsu          | Weekly slot, annual open-mat membership and contact rule              | [Pricing](https://bulijj.fi/pricing), [visitor instructions](https://bulijj.fi/page/haluatko-tulla-kokeilemaan-bulin-treenej-tai-vierailemaan-meill-) |
| Loop Martial Arts       | Seasonal end date and replacement timetable                           | [Calendar](https://www.loopmartialarts.fi/kalenteri)                                                                                                  |
| Dojo Helsinki           | Weekly time, holidays and outside-club eligibility                    | [Training times](https://www.dojohelsinki.fi/treeniajat/)                                                                                             |
| FireBody                | Weekly schedule and access wording                                    | [Schedule](https://firebody.fi/tuntiaikataulu/)                                                                                                       |
| Savate Club             | Konala seasonal free-practice slots and visitor access                | [Training times](https://www.savate.com/harjoitusajat/)                                                                                               |
| Salini Sports Center    | Weekly sparring and separately announced public events                | [Schedule](https://www.salini.fi/tuntiohjelma/)                                                                                                       |

The full maintained list, including sources where no current open mat was found,
remains in `data/source-registry.json`.

## Discovery review: 14 July 2026

The metropolitan-area review checked Finnish- and English-language official
results for BJJ, no-gi and submission-wrestling venues and open mats. It found
no additional active in-scope venue beyond the existing registry baseline.

The review did add or refine evidence for existing venues:

- GB Gym has exact calendar entries on 30 August, 27 September, 25 October and
  27 December 2026. The 29 November entry is explicitly cancelled. No dated
  July open mat is listed.
- Combat Academy's preliminary 17 August–19 December timetable has a Friday
  17:30–19:00 open mat, with outside-club access still unconfirmed.
- HIPKO Metsälä's 15 June–9 August PDF has Saturday and Sunday BJJ open mats at
  15:00–17:00, with outside-club access still unconfirmed.
- Loop Martial Arts' current summer candidate is bounded to 1 June–2 August.
- Art of Ground Games explicitly welcomes visitors generally, but its dynamic
  schedule can impose session-specific member or belt restrictions.

Discovery results in Kirkkonummi, Vihti and other neighboring municipalities
were excluded because they are outside the current four-city scope. General
wrestling open mats were excluded when the official source did not identify BJJ,
no-gi or submission wrestling.

## Recording a review

Update the registry's `discoveryReviewedAt` and `discoveryReviewNotes` after a
broad review. Update a venue's `checkedAt` only when its official evidence was
actually inspected. Use `datedOpenMats` for exact calendar entries, including
cancellations, and `candidateOpenMats` for recurring time-bounded slots.

Run `pnpm validate` after every registry change.
