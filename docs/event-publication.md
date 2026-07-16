# Event publication

The first recurring-event review window covers 15 July–9 August 2026.
Recurring schedules are materialized into individual dated events only inside
that review window. This prevents an undated weekly timetable from producing
events indefinitely. Exact dated entries from an official calendar can extend
beyond the recurring review window when each occurrence is stored explicitly.

The recurrence and review records are stored in
[`data/event-series.json`](../data/event-series.json). The dated public events
remain in [`src/data/events.json`](../src/data/events.json). Tests require all
publishable recurring occurrences to be present while allowing separately
verified, exact calendar entries.

## Gi and No-gi model

The Finnish user interface does not separate a discipline from attire. It uses
only the familiar local categories `Gi` (BJJ) and `No-gi` (submission
wrestling). Each event therefore has a nullable `formats` field:

- `["gi"]` means Gi only;
- `["no-gi"]` means No-gi only;
- `["gi", "no-gi"]` means both are explicitly allowed;
- `null` means the source does not say, so the interface tells the visitor to
  check with the organizer.

Once a source explicitly identifies one format and excludes the other, the
interface can show the unavailable format with a cross. Missing information is
never interpreted as exclusion.

## Published series

### Art of Ground Games

The official AOGG open-mat policy welcomes visitors from other clubs, while
the location-specific Gymdesk calendars provide the session restrictions and
recurrence data. Two visitor sessions are published inside the current review
window:

- Erottaja: Sunday 12:00–14:00, No-gi;
- Sörnäinen: Saturday 12:00–14:00, No-gi and coloured belts only.

Both calendars accept advance bookings and show no cancelled dates. The
official visitor page gives a 15-euro drop-in price and asks visitors to reserve
a spot. AOGG's separately named members-only open mats remain unpublished.
Kivenlahti currently shows only members-only open mats, so it has no public
occurrence in the event list.

### Helsingin Ju-jutsuklubi

The official BJJ page states that the Saturday 13:00–15:00 open mat welcomes
people from other clubs who know the BJJ fundamentals. It can be practised in a
gi or no-gi. The session is held only if no other event uses the gym.

The official event page was checked for the publication window. It lists no
conflicting BJJ event before the BJJ NoGi Finnish Open on 22–23 August. Four
dated Saturday occurrences are therefore published. The visitor price is left
unknown because the open-mat source does not state one.

### Tundra Jiu-Jitsu

The official schedule states that Saturday 11:15–12:45 is gi/no-gi and open to
everyone, including members of other clubs. The official price page gives a
14-euro non-member single visit and asks visitors to contact the gym before
attending.

The schedule also says that summer training mostly runs normally but may have
exceptions. It does not publish exact cancelled dates. Four occurrences are
listed with `uncertain` status and a visible advance-confirmation instruction.

### GB Gym

The official 2026 calendar gives exact open mat dates and times on 30 August,
27 September, 25 October and 27 December. The 29 November open mat is
explicitly cancelled because of a junior competition and is not published as
an upcoming event.

The project owner confirmed on 14 July 2026 that these open mats are free, open
to all practitioners and allow either Gi or No-gi. Those details are recorded
as owner-provided confirmation rather than attributed to the calendar. The four
scheduled entries are published with both formats available. August and
September use UTC offset `+03:00`; October and December use `+02:00` according to
`Europe/Helsinki` daylight-saving rules.

### MMA Vantaa

MMA Vantaa's live official page now places the dates and time in the same clear
summer schedule: Sunday 12:00–13:30 from 1 June through 9 August 2026. It
explicitly welcomes people from outside the club. Visitors must be at the door
before the session starts because entry to the rock shelter requires a member's
door code.

The earlier inconsistent 12:00–14:00 rendering is no longer present on the
live page, so the source conflict is resolved. Four Sunday occurrences are
published through the current materialization limit. Price and Gi/No-gi
eligibility remain unknown because the official source does not state them.

## Blocked series: Buli Urhea

Buli's official pricing and membership flow identify a weekly Sunday
12:00–13:30 open mat at Urhea for both Gi and No-gi. The open-mat membership
costs 25 euros per calendar year. The visitor page asks people to contact the
club before visiting or trying the open mat before buying the membership.

The dated official calendar was reviewed week by week from 19 July through 20
September 2026. It contains no Urhea open-mat occurrence in that range. The
membership description and dated calendar therefore do not currently support
publishing any exact date. The series is stored under `buli-urhea`, marked
`blocked_conflicting_source`, and produces no public event until the dated
calendar lists one. The previous registry attachment to Konepaja was incorrect
and has been removed.

## Materialization rules

- A series produces only the requested ISO weekday between the publication
  window and its own validity boundaries.
- An exact official calendar entry may be published directly outside the
  recurring window when its date and time are explicit.
- Dates in `excludedDates` are omitted.
- A series with conflicting official evidence produces no events.
- A recurring membership description does not override a dated calendar that
  contains no matching occurrence.
- A location-wide visitor policy does not override a session explicitly marked
  members-only or a belt restriction shown in its booking calendar.
- Every event keeps its source URL, verification time, exception-check time,
  materialization limit and a user-facing exception note.
- Helsinki summer dates in this window use UTC offset `+03:00`. A future window
  crossing a daylight-saving boundary must use the correct Helsinki offset.
- The source and exception pages must be checked again before extending the
  window beyond 9 August 2026.
