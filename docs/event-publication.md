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

## Price evidence

An event is marked paid only when a first-party source attributes a fee to the
open mat itself. A gym-wide drop-in, visitor pass or single-visit price is not
automatically an open-mat price. Such an event remains in the `unknown` price
category until the organizer publishes or directly confirms the open-mat fee.
Owner-confirmed free entry may be stored with that provenance stated in the
review notes.

## Published series

### Art of Ground Games

The official AOGG open-mat policy welcomes visitors from other clubs, while
the location-specific Gymdesk calendars provide the session restrictions and
recurrence data. Two visitor sessions are published inside the current review
window:

- Erottaja: Sunday 12:00–14:00, No-gi;
- Sörnäinen: Saturday 12:00–14:00, No-gi and coloured belts only.

Both calendars accept advance bookings and show no cancelled dates. AOGG's
visitor page lists a general 15-euro drop-in, but it does not attribute that
price specifically to open mats; the published events therefore show an
unknown price. AOGG's separately named members-only open mats remain
unpublished. Kivenlahti currently shows only members-only open mats, so it has
no public occurrence in the event list.

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
general 14-euro non-member single visit, but does not identify it as the open
mat fee. The event price is therefore left unknown. Visitors are asked to
contact the gym before attending.

The schedule also says that summer training mostly runs normally but may have
exceptions. It does not publish exact cancelled dates. Four occurrences are
listed with `uncertain` status and a visible advance-confirmation instruction.

### Loop Martial Arts

Loop's official summer 2026 calendar lists a Saturday 10:30–12:00 BJJ open mat
from 1 June through 2 August. Its official English calendar identifies the
recurring slot as BJJ/No-Gi. The project owner confirmed on 16 July 2026 that
the open mat is free, open to outside-club practitioners and allows either Gi
or No-gi.

The three remaining Saturdays on 18 July, 25 July and 1 August are published.
The bounded summer series is not extended to 8 August or into autumn by
assumption; a new official seasonal timetable must be reviewed first.

### Dojo Helsinki

Dojo's official Finnish and English timetables list Saturday 12:00–13:00 open
mat at Pursimiehenkatu 14. The project owner confirmed on 16 July 2026 that the
session is open to outside-club practitioners and uses No-gi attire. The
visitor price is unknown because the official sources do not state one.

Four Saturdays through 8 August are published. Dojo's official Instagram
account is a supporting monitoring source for holiday changes and additional
open mats, which must be added as separately dated events.

### Kilo Jiu-Jitsu

The project owner confirmed on 16 July 2026 that Kilo has a public Saturday
11:00–12:30 open mat at Kutojantie 5, second floor. The official venue page
confirms the address, and the price page states a 15-euro drop-in price from 1
June 2026. The official schedule page remains labelled 2023 and does not
currently verify the slot, attire or exceptions.

Four Saturdays through 8 August are published with `uncertain` status and a
visible confirmation reminder. Attire is deliberately stored as unknown. The
official schedule and Instagram must be checked again before extending or
fully verifying the recurring series. Kilo's general 15-euro single-visit
price is not presented as the open-mat price because the price source does not
make that connection.

### HIPKO Metsälä

HIPKO's official 15 June–9 August summer timetable lists unsupervised BJJ open
mats on Saturdays and Sundays from 15:00 to 17:00. The eight remaining dates
inside the current publication window are listed with `uncertain` status.

The timetable does not say whether practitioners from other clubs may attend
these BJJ sessions or what an open-mat visit costs. The event cards therefore
show an unknown price and tell the visitor to confirm participation with HIPKO.
No recurrence is generated beyond 9 August.

### Takado

Takado's current official BJJ / No-gi timetable lists open mats on Tuesdays
16:30–18:00 and Saturdays 11:00–13:00 at Pihatörmä 1 D. The same page describes
open mat as open to everyone and instructs participants to enroll through
myClub. Both series are materialized inside the current publication window.

The page does not specify the attire or an open-mat price, so both remain
unknown in the event cards. No dated cancellation was published during this
review.

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

### Buli Urhea

Buli's official pricing and membership flow identify a weekly Sunday
12:00–13:30 open mat at Urhea for both Gi and No-gi. The open-mat membership
costs 25 euros per calendar year. The visitor page asks people to contact the
club before visiting or trying the open mat before buying the membership.

Recent community feedback says the session is running in summer, but the dated
official calendar contains no matching Urhea open-mat occurrence in the current
publication window. The membership page still provides an active weekly
Sunday recurrence, so four Sundays are published with `uncertain` status and a
visible confirmation reminder. The price is shown as a 25-euro annual open-mat
membership, not as a per-session charge. The previous registry attachment to
Konepaja was incorrect and has been removed.

## Materialization rules

- A series produces only the requested ISO weekday between the publication
  window and its own validity boundaries.
- An exact official calendar entry may be published directly outside the
  recurring window when its date and time are explicit.
- Dates in `excludedDates` are omitted.
- An explicit cancellation or a conflicting official date or time prevents
  publication. Absence from a dated calendar can instead require a visible
  confirmation warning when another current official source gives a recurrence.
- A location-wide visitor policy does not override a session explicitly marked
  members-only or a belt restriction shown in its booking calendar.
- A general gym drop-in price is not copied to an open mat unless the source
  explicitly connects the fee to that session.
- Every event keeps its source URL, verification time, exception-check time,
  materialization limit and a user-facing exception note.
- Helsinki summer dates in this window use UTC offset `+03:00`. A future window
  crossing a daylight-saving boundary must use the correct Helsinki offset.
- The source and exception pages must be checked again before extending the
  window beyond 9 August 2026.
