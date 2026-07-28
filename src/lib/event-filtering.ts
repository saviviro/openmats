import {
  isUpcomingEvent,
  type EventFormat,
  type EventPriceCategory,
} from "./events";

export type EventListFilterState = {
  city: string;
  format: "all" | EventFormat | string;
};

export type FilterableEvent = {
  city: string;
  formats: string[];
  priceCategory: string;
  endAt: string;
};

export function matchesEventFilters(
  event: FilterableEvent,
  filters: EventListFilterState,
  selectedPriceCategories: ReadonlySet<EventPriceCategory | string>,
  now: Date | number = Date.now(),
): boolean {
  const cityMatches = filters.city === "all" || event.city === filters.city;
  const formatMatches =
    filters.format === "all" || event.formats.includes(filters.format);
  const priceMatches = selectedPriceCategories.has(event.priceCategory);

  return (
    cityMatches &&
    formatMatches &&
    priceMatches &&
    isUpcomingEvent(event.endAt, now)
  );
}
