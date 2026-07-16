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

| City       | Active venues | Planned venues | Result                                                        |
| ---------- | ------------: | -------------: | ------------------------------------------------------------- |
| Helsinki   |            18 |              1 | Official sources mapped; several require manual access review |
| Espoo      |             8 |              0 | Official sources mapped                                       |
| Vantaa     |             4 |              0 | Official sources mapped                                       |
| Kauniainen |             0 |              0 | Searched; no active venue with an official source found       |

The numbers count physical training locations, not organizations. An
organization with three gyms therefore contributes three venue records.
Kauniainen remains explicitly in scope even though the first Finnish- and
Swedish-language search found no current venue. It must be checked again during
periodic discovery reviews.

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
Kaapelitehdas, Tundra Jiu-Jitsu in Suomenoja, AOGG Erottaja, AOGG Sörnäinen and
MMA Vantaa. The AOGG location calendars must still be interpreted separately:
Erottaja has a public Sunday No-gi session, Sörnäinen has a public Saturday
No-gi session for coloured belts, and Kivenlahti currently lists only
members-only open mats. MMA Vantaa's live summer timetable now unambiguously
shows 12:00–13:30 and explicitly welcomes visitors, so its previous conflict is
resolved.

Buli's membership sources identify a Sunday 12:00–13:30 Gi and No-gi open mat
at Urhea, but the dated calendar currently lists no occurrence, so the series
is blocked rather than attached to Konepaja or materialized by assumption.

High-priority manual-review sources include Loop Martial Arts, Dojo Helsinki,
Combat Academy, HIPKO, FireBody, Savate Club and Salini. Their current official
sources show open mats, free practice or sparring, but do not provide enough
evidence to publish outside-club access automatically. FireBody also needs a
current seasonal timetable: its live page is still labelled spring 2026.

GB Gym's official calendar currently contains exact monthly open mats on 30
August, 27 September, 25 October and 27 December 2026. It explicitly cancels
the 29 November entry, and contains no dated July open mat. These observations
are stored under `datedOpenMats`. The four scheduled dates are published with
their official dates and times. The project owner confirmed on 14 July 2026 that
they are free, open to all practitioners and allow gi or no-gi; this provenance
is kept separate from the official calendar evidence. The registry also records
new time-bounded candidates for Combat Academy's preliminary autumn schedule
and HIPKO Metsälä's summer PDF, plus a corrected summer end date for Loop
Martial Arts.

## Updating the registry

For every review:

1. Prefer the venue's or organizer's official schedule, visitor policy,
   calendar or event post.
2. Record the exact source URL and a Helsinki-offset ISO 8601 `checkedAt`
   timestamp.
3. Update seasonal `validFrom` and `validThrough` boundaries. Never extend a
   seasonal candidate beyond its stated end date.
4. Store exact calendar entries and explicit cancellations in `datedOpenMats`.
   A cancellation must use `cancelled_do_not_publish`.
5. Keep uncertain or conflicting information out of published event data and
   describe the unresolved point in `monitoringNotes`.
6. Preserve an existing verified event if one source check fails. Source
   failure and event expiration are separate states.
7. Before automating a source, review its terms, `robots.txt`, request rate and
   available structured feeds. Do not bypass login, CAPTCHA or access controls.
8. Run `pnpm validate` before committing registry changes.

Broad web discovery should periodically look for new venues, renamed gyms and
changed official channels in all four cities. Routine checks should start from
this registry instead of repeating an expensive unrestricted search every
week.
