# Source registry

The maintained source registry is stored in
[`data/source-registry.json`](../data/source-registry.json). It separates three
questions that must not be treated as the same thing:

1. Does the venue currently offer BJJ, no-gi or submission wrestling?
2. Does an official source show an open mat or an equivalent sparring session?
3. Does an official source confirm that people from other clubs may attend?

The initial mapping was checked on 14 July 2026 and expanded in a broad review
on 17 August 2026. It is a documented baseline, not a claim that an internet
search can prove permanent completeness. The repeatable check order and
high-yield source list are documented in
[source-monitoring.md](source-monitoring.md).

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

The maintained recurring sources include Helsingin Ju-jutsuklubi at
Kaapelitehdas, Tundra Jiu-Jitsu in Suomenoja, Loop Martial Arts in Pitäjänmäki,
AOGG Erottaja, AOGG Sörnäinen, Dojo Helsinki in Punavuori, HIPKO Metsälä,
Kilo Jiu-Jitsu in Kilo, Takado in Haukilahti, TK Sports in Suutarila and MMA
Vantaa. HIPKO remains a bounded historical series and currently
produces no future events. The AOGG location calendars must still be interpreted
separately:
Erottaja has a public Sunday No-gi session, Sörnäinen has a public Saturday
No-gi session for coloured belts, and Kivenlahti currently lists only
members-only open mats. The exact Erottaja and Sörnäinen booking settings show
zero-euro booking for non-members, so those sessions are published as free.
Their recurring records use date-parameterized organizer URLs so every
occurrence links to its own booking date. MMA Vantaa's current official timetable
lists Sunday 12:00–14:00 on the small tatami and explicitly welcomes visitors.
Its recurring series is published within the rolling window; the club timetable
and linked Vantaa exception-hours page are checked before extending that window.

Buli's membership sources identify a Sunday 12:00–13:30 Gi and No-gi open mat
at Urhea. The dated calendar explicitly marks 9 and 16 August closed but does
not establish later cancellations, so future Sundays are visibly marked for
confirmation. The series is attached to Urhea rather than Konepaja.

High-priority manual-review sources include Combat Academy, HIPKO, FireBody,
Savate Club and Salini. HIPKO's verified summer timetable expired on 9 August,
and its current autumn page links a BJJ curriculum rather than a weekly public
open-mat timetable. The summer candidates are retained but not extended.
FireBody's autumn timetable starts on 10 August and lists Saturday BJJ
self-practice at
13:00–14:00, but outside-club access is still unconfirmed. Savate Club's
maintained URL currently shows a 2024 timetable and therefore supports no
current 2026 candidate.

Dojo Helsinki's official Finnish and English timetables list Saturday
12:00–13:00 open mat. The project owner confirmed outside-club access and No-gi
attire on 16 July 2026. The recurring series is published, and Dojo's official
Instagram account is retained for holiday changes and additional dated open
mats.

Kilo Jiu-Jitsu's live embedded official calendar now confirms Saturday
11:00–12:30 open mats on most reviewed dates through 10 October. It omits
5 September without an explicit cancellation, so the recurring event remains
visible with a confirmation warning. The project owner confirmed public access
on 16 July 2026. Attire remains unknown, and the general 15-euro single-visit
price is not treated as an open-mat price.

HIPKO Metsälä's historical summer rows keep their original row-specific access
interpretation; member-only wording shown on other rows must not be generalized
to them. No recurrence is generated after 9 August. Takado's current official
timetable lists Tuesday and Saturday open mats, explicitly calls them open to
everyone and directs participants to myClub; attire and price remain unknown.

Loop's official autumn calendar lists a Saturday 10:30–12:00 BJJ open mat from
3 August through 23 December 2026, while its official English calendar
identifies the slot as BJJ/No-Gi. The project owner confirmed on 16 July 2026
that it is free, open to outside-club practitioners and allows Gi or No-gi.
Only dates inside both the seasonal boundary and rolling publication window are
materialized.

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
time-bounded candidates for Combat Academy's preliminary autumn schedule,
HIPKO Metsälä's expired summer PDF and Loop Martial Arts' current autumn
calendar.

The 17 August broad discovery added five active venues that were missing from
the baseline: Kaski Kamppailu in Maunula; Espoon Kehähait in Lippulaiva; Sambo
Espoo in Tapiola; Sport Club Achilles in Matinkylä; and PP Jiujitsu Helsinki's
training venue in Myyrmäki, Vantaa. Governing-body records or first-party pages
confirm each venue, but no current official public open mat was found. They are
therefore retained as `discovery_only` and do not create event candidates.

HJJK's Saturday recurrence is conditional on no other event using its
Kaapelitehdas gym. The 22–23 August 2026 BJJ No-Gi Finnish Open is listed in
Vantaa, so it is not evidence of a Kaapelitehdas venue conflict and does not
exclude the 22 August HJJK open mat.

## Discovery review: 16 September 2026

The four-city review rechecked the maintained official-source baseline and
current Finnish- and English-language discovery results. It found no new
first-party evidence for an additional publishable public BJJ or submission-
wrestling open mat. A secondary listing showed current Art of Ground Games
Kivenlahti sessions, but the official evidence reviewed for this project did
not resolve their session-specific visitor restrictions, so no event was added.
Kauniainen still has no verified active in-scope venue. Unreachable or expired
sources were retained as monitoring issues and were not treated as evidence of
cancellation or member-only access.

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
