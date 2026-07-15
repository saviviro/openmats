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

## Blocked series: MMA Vantaa

MMA Vantaa explicitly welcomes people from outside the club to its Sunday open
mat. Its official-source evidence currently conflicts on the end time:

- a recent indexed copy of the official page labels the summer schedule as
  1 June–9 August 2026 and gives 12:00–13:30;
- the same live official URL now gives 12:00–14:00 without an effective date.

The City of Vantaa exception calendar does not list a July or early-August
closure for the Rajatorppa rock shelter, but that does not resolve the time
conflict. The series is retained as `blocked_conflicting_source` and produces
no public event. No time is selected by guesswork.

The conflict was checked again on 15 July 2026 and remained unresolved. The
official Combat Academy schedule showed its open mat at the Helsinki location,
not Myyrmäki. Salini's official timetable showed Saturday BJJ sparring in
Rekola, but did not confirm outside-club access. No additional publishable
Vantaa event was therefore added.

## Materialization rules

- A series produces only the requested ISO weekday between the publication
  window and its own validity boundaries.
- An exact official calendar entry may be published directly outside the
  recurring window when its date and time are explicit.
- Dates in `excludedDates` are omitted.
- A series with conflicting official evidence produces no events.
- Every event keeps its source URL, verification time, exception-check time,
  materialization limit and a user-facing exception note.
- Helsinki summer dates in this window use UTC offset `+03:00`. A future window
  crossing a daylight-saving boundary must use the correct Helsinki offset.
- The source and exception pages must be checked again before extending the
  window beyond 9 August 2026.
