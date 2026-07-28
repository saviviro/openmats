# Source registry

The maintained source registry is stored in
[`data/source-registry.json`](../data/source-registry.json). It separates three
questions that must not be treated as the same thing:

1. Does the venue currently offer BJJ, no-gi or submission wrestling?
2. Does an official source show an open mat or an equivalent sparring session?
3. Does an official source confirm that people from other clubs may attend?

The initial mapping and a broader discovery review were checked on 14 July 2026. It is a documented baseline, not a claim that an internet search can
prove permanent completeness. The repeatable check order and high-yield source
list are documented in [source-monitoring.md](source-monitoring.md).

## Geographic coverage

| City       | Current registry status                                       |
| ---------- | ------------------------------------------------------------- |
| Helsinki   | Official sources mapped; several require manual access review |
| Espoo      | Official sources mapped                                       |
| Vantaa     | Official sources mapped                                       |
| Kauniainen | Searched; no active venue with an official source found       |

Machine-readable venue and planning counts live only in the registry's
`coverage` records and are validated against the maintained data. They are not
copied into this narrative document, where they would become stale as venues
are added or renamed. A physical location is one venue record even when an
organization operates several gyms. Kauniainen remains explicitly in scope and
must be checked again during periodic discovery reviews.

## Access classifications

- `public_confirmed`: an official source explicitly welcomes outside-club
  visitors.
- `public_with_conditions`: outside-club visitors are accepted, but contact,
  registration, payment, arrival or another stated condition applies.
- `members_only_confirmed`: an official source explicitly limits the session
  to members.
- `mixed`: the same venue has sessions with different access rules.
- `unconfirmed`: an open mat or similar session exists, but visitor access is
  not stated clearly enough.
- `no_open_mat_found`: the venue is relevant to discovery, but the review did
  not find a current official open-mat source.

An `open mat` label in a members' timetable is not evidence of public access.
This distinction is especially important for seasonal PDF schedules and terms
such as _vapaavuoro_, _omatoimi_ and _avoin sparrivuoro_.

## Collection readiness

- `ready`: the recurring slot and visitor policy have sufficient official
  evidence to create dated event candidates, subject to exception checks.
- `manual_review`: a human must interpret a dynamic schedule, seasonal
  validity, visitor rule or other context.
- `discovery_only`: retain the official source for periodic checks; there is no
  current publishable open mat.
- `planned`: the venue has been announced but has not opened with complete
  location and schedule information.

The materialized recurring sources now include Helsingin Ju-jutsuklubi at
Kaapelitehdas, Tundra Jiu-Jitsu in Suomenoja, Loop Martial Arts in Pitäjänmäki,
AOGG Erottaja, AOGG Sörnäinen, Dojo Helsinki in Punavuori, HIPKO Metsälä,
Kilo Jiu-Jitsu in Kilo, Takado in Haukilahti, TK Sports in Suutarila and MMA Vantaa. The AOGG location
calendars must still be interpreted separately:
Erottaja has a public Sunday No-gi session, Sörnäinen has a public Saturday
No-gi session for coloured belts, and Kivenlahti currently lists only
members-only open mats. The exact Erottaja and Sörnäinen booking settings show
zero-euro booking for non-members, so those sessions are published as free.
Their recurring records use date-parameterized organizer URLs so every
occurrence links to its own booking date. MMA Vantaa's live summer timetable now
unambiguously shows 12:00–13:30 and explicitly welcomes visitors, so its
previous conflict is resolved.

Buli's membership sources identify a Sunday 12:00–13:30 Gi and No-gi open mat
at Urhea, and community feedback says it is running in summer. The dated
calendar still lists no matching occurrence in the current publication window,
so the materialized Sundays are visibly marked for confirmation. The series is
attached to Urhea rather than Konepaja.

High-priority manual-review sources include Combat Academy, HIPKO, FireBody,
Savate Club and Salini. HIPKO's summer timetable marks some weekday open mats
for HIPKO members, but the weekend BJJ rows do not carry that label. Those
dated sessions remain published only with a confirmation warning. FireBody's autumn
timetable starts on 10 August and lists Saturday BJJ self-practice at
13:00–14:00, but outside-club access is still unconfirmed. Savate Club's
maintained URL currently shows a 2024 timetable and therefore supports no
current 2026 candidate.

Dojo Helsinki's official Finnish and English timetables list Saturday
12:00–13:00 open mat. The project owner confirmed outside-club access and No-gi
attire on 16 July 2026. The recurring series is published, and Dojo's official
Instagram account is retained for holiday changes and additional dated open
mats.

The project owner confirmed Kilo Jiu-Jitsu's public Saturday 11:00–12:30 slot
on 16 July 2026. Its official site confirms the second-floor Kutojantie venue,
but the official schedule page is still labelled 2023. Attire remains unknown
and the published occurrences visibly require confirmation until Kilo
publishes a current first-party timetable. Its general 15-euro single-visit
price is not treated as an open-mat price.

HIPKO Metsälä's official summer timetable lists Saturday and Sunday BJJ open
mats through 9 August. Because outside-club access and price are not stated,
the dates are published only with a confirmation warning. Member-only wording
shown on other rows must not be generalized to these weekend sessions. Takado's
current official timetable lists Tuesday and Saturday open mats, explicitly
calls them open to everyone and directs participants to myClub; attire and
price remain unknown.

Loop's official summer calendar lists a Saturday 10:30–12:00 BJJ open mat
through 2 August 2026, while its official English calendar identifies the slot
as BJJ/No-Gi. The project owner confirmed on 16 July 2026 that it is free, open
to outside-club practitioners and allows Gi or No-gi. Only dates inside both the
seasonal boundary and rolling publication window are materialized; the bounded
series must be replaced rather than extended when Loop publishes its autumn
schedule.

TK Sports' official timetable lists a Saturday 10:00–12:00 open mat for all
levels at Halmetie 5. The timetable does not specify Gi or No-gi attire, an
open-mat visitor price or whether practitioners from other clubs may attend,
and it warns that the schedule may change. The current dates are therefore
published with unknown attire and price plus a visible confirmation reminder.

GB Gym's official calendar currently contains exact monthly open mats on 30
August, 27 September, 25 October and 27 December 2026. It explicitly cancels
the 29 November entry, and contains no dated July open mat. These observations
are stored under `datedOpenMats`, where every row carries the stable
`gb-gym-monthly-open-mat` `seriesId`. Scheduled dates are published with their
official dates and times. The project owner confirmed on 14 July 2026 that they
are free, open to all practitioners and allow gi or no-gi; this provenance is
kept separate from the official calendar evidence. The registry also records
time-bounded candidates for Combat Academy's preliminary autumn schedule and
HIPKO Metsälä's summer PDF, plus the reviewed summer end date for Loop Martial
Arts.

HJJK's Saturday recurrence is conditional on no other event using its
Kaapelitehdas gym. The 22–23 August 2026 BJJ No-Gi Finnish Open is listed in
Vantaa, so it is not evidence of a Kaapelitehdas venue conflict and does not
exclude the 22 August HJJK open mat.

## Updating the registry

For every review:

1. Prefer the venue's or organizer's official schedule, visitor policy,
   calendar or event post.
2. Record the exact source URL and a Helsinki-offset ISO 8601 `checkedAt`
   timestamp.
3. Update seasonal `validFrom` and `validThrough` boundaries. Never extend a
   seasonal candidate beyond its stated end date.
4. Store exact calendar entries and explicit cancellations in `datedOpenMats`.
   Every row requires a stable `seriesId` with a matching
   `data/event-templates.json` template. A cancellation must use
   `cancelled_do_not_publish`.
5. Record a recurring date in `excludedDates` only with one matching
   `excludedDateEvidence` record containing the official source URL,
   `checkedAt` timestamp and date-specific reason. An event at another venue or
   an unreadable source is not enough.
6. Keep uncertain or conflicting information out of published event data and
   describe the unresolved point in `monitoringNotes`.
7. Preserve an existing verified event if one source check fails. Source
   failure and event expiration are separate states.
8. Before automating a source, review its terms, `robots.txt`, request rate and
   available structured feeds. Do not bypass login, CAPTCHA or access controls.
9. Run `pnpm events:refresh` and `pnpm validate` before committing registry
   changes. `src/data/events.json` is generated output and must not be maintained
   manually.

For pricing, record a paid amount only when a first-party source specifically
attributes the fee to the open mat. A general drop-in, visitor pass or
single-visit price is supporting context, not sufficient price evidence for an
open-mat event. Conversely, AOGG's exact booking settings identify the relevant
Erottaja and Sörnäinen sessions as free for non-members, which is sufficient
session-specific zero-euro evidence.

Broad web discovery should periodically look for new venues, renamed gyms and
changed official channels in all four cities. Routine checks should start from
this registry instead of repeating an expensive unrestricted search every
week.
