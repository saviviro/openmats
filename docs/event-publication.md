# First verified event publication

The first real event window covers 15 July–9 August 2026. Recurring schedules
are materialized into individual dated events only inside that review window.
This prevents an undated weekly timetable from producing events indefinitely.

The recurrence and review records are stored in
[`data/event-series.json`](../data/event-series.json). The dated public events
remain in [`src/data/events.json`](../src/data/events.json). Tests require the
two files to agree.

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

## Materialization rules

- A series produces only the requested ISO weekday between the publication
  window and its own validity boundaries.
- Dates in `excludedDates` are omitted.
- A series with conflicting official evidence produces no events.
- Every event keeps its source URL, verification time, exception-check time,
  materialization limit and a user-facing exception note.
- Helsinki summer dates in this window use UTC offset `+03:00`. A future window
  crossing a daylight-saving boundary must use the correct Helsinki offset.
- The source and exception pages must be checked again before extending the
  window beyond 9 August 2026.
