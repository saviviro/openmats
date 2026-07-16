import { intlLocale, type Locale } from "./i18n";

export const HELSINKI_TIME_ZONE = "Europe/Helsinki";

export type EventStatus =
  "scheduled" | "cancelled" | "rescheduled" | "uncertain";
export type EventFormat = "gi" | "no-gi";
export type EventFormatState = "available" | "unavailable" | "unknown";
export type EventPriceCategory = "free" | "paid" | "unknown";

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

export function sortEvents<T>(
  events: T[],
  getStartAt: (event: T) => string,
): T[] {
  return [...events].sort(
    (first, second) =>
      Date.parse(getStartAt(first)) - Date.parse(getStartAt(second)),
  );
}

export function isUpcomingEvent(
  endAt: string,
  now: Date | number = Date.now(),
): boolean {
  const endTime = Date.parse(endAt);
  const referenceTime = now instanceof Date ? now.getTime() : now;

  return Number.isFinite(endTime) && endTime > referenceTime;
}

export function formatEventDate(
  isoDate: string,
  locale: Locale = "fi",
): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "short",
    day: "numeric",
    month: "long",
    timeZone: HELSINKI_TIME_ZONE,
  }).format(new Date(isoDate));
}

export function formatEventTime(
  isoDate: string,
  locale: Locale = "fi",
): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: HELSINKI_TIME_ZONE,
  })
    .format(new Date(isoDate))
    .replace(".", ":");
}

export function keepEuroAmountTogether(text: string): string {
  return text.replace(/(\d)\s+(?=€(?:\s|$))/gu, "$1\u00a0");
}

export function getEventPriceCategory(
  amount: number | null,
): EventPriceCategory {
  if (amount === null) return "unknown";
  return amount === 0 ? "free" : "paid";
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
