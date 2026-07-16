export const HELSINKI_TIME_ZONE = "Europe/Helsinki";

export type EventStatus =
  "scheduled" | "cancelled" | "rescheduled" | "uncertain";
export type EventFormat = "gi" | "no-gi";
export type EventFormatState = "available" | "unavailable" | "unknown";

export interface EventForDisplay {
  id: string;
  title: string;
  formats: EventFormat[] | null;
  startAt: string;
  venue: {
    name: string;
    city: string;
  };
}

const dateFormatter = new Intl.DateTimeFormat("fi-FI", {
  weekday: "short",
  day: "numeric",
  month: "long",
  timeZone: HELSINKI_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("fi-FI", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: HELSINKI_TIME_ZONE,
});

const verifiedFormatter = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: HELSINKI_TIME_ZONE,
});

export function sortEvents<T>(
  events: T[],
  getStartAt: (event: T) => string,
): T[] {
  return [...events].sort(
    (first, second) =>
      Date.parse(getStartAt(first)) - Date.parse(getStartAt(second)),
  );
}

export function formatEventDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatEventTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate)).replace(".", ":");
}

export function formatVerifiedDate(isoDate: string): string {
  return verifiedFormatter.format(new Date(isoDate));
}

export function keepEuroAmountTogether(text: string): string {
  return text.replace(/(\d)\s+(?=€(?:\s|$))/gu, "$1\u00a0");
}

export function eventIdentity(event: EventForDisplay): string {
  return [
    normalizeIdentityPart(event.venue.name),
    event.startAt,
    event.formats === null ? "unknown" : [...event.formats].sort().join("+"),
  ].join("|");
}

export function getEventFormatStates(
  formats: EventFormat[] | null,
): Array<{ format: EventFormat; state: EventFormatState }> {
  return (["gi", "no-gi"] as const).map((format) => ({
    format,
    state:
      formats === null
        ? "unknown"
        : formats.includes(format)
          ? "available"
          : "unavailable",
  }));
}

export function findDuplicateEventIds(events: EventForDisplay[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const event of events) {
    const identity = eventIdentity(event);
    groups.set(identity, [...(groups.get(identity) ?? []), event.id]);
  }

  return [...groups.values()].filter((ids) => ids.length > 1);
}

function normalizeIdentityPart(value: string): string {
  return value.trim().toLocaleLowerCase("fi-FI").replace(/\s+/g, " ");
}
