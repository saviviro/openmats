import { z } from "astro/zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const eventSeriesRegistrySchema = z.object({
  version: z.literal(1),
  checkedAt: z.iso.datetime({ offset: true }),
  window: z.object({
    from: isoDateSchema,
    through: isoDateSchema,
    timezone: z.literal("Europe/Helsinki"),
    utcOffset: z.string().regex(/^[+-]\d{2}:\d{2}$/),
  }),
  series: z.array(
    z
      .object({
        id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        venueId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        publicationStatus: z.enum([
          "publish",
          "publish_with_confirmation",
          "blocked_conflicting_source",
        ]),
        weekday: z.number().int().min(1).max(7),
        startTime: localTimeSchema,
        endTime: localTimeSchema,
        validFrom: isoDateSchema.nullable(),
        validThrough: isoDateSchema.nullable(),
        excludedDates: z.array(isoDateSchema),
        primarySourceUrl: z.url(),
        supportingSourceUrls: z.array(z.url()),
        exceptionCheck: z.object({
          result: z.enum([
            "none_found",
            "confirmation_required",
            "conflict_found",
          ]),
          checkedAt: z.iso.datetime({ offset: true }),
          notes: z.string().min(10),
        }),
      })
      .refine(({ startTime, endTime }) => endTime > startTime, {
        message: "Series endTime must be later than startTime",
        path: ["endTime"],
      })
      .refine(
        ({ validFrom, validThrough }) =>
          validFrom === null ||
          validThrough === null ||
          validThrough >= validFrom,
        {
          message: "Series validThrough must not precede validFrom",
          path: ["validThrough"],
        },
      ),
  ),
});

export type EventSeriesRegistry = z.infer<typeof eventSeriesRegistrySchema>;
export type EventSeries = EventSeriesRegistry["series"][number];

export function parseEventSeriesRegistry(input: unknown): EventSeriesRegistry {
  return eventSeriesRegistrySchema.parse(input);
}

export function materializeOccurrenceDates(
  series: EventSeries,
  window: EventSeriesRegistry["window"],
): string[] {
  if (series.publicationStatus === "blocked_conflicting_source") return [];

  const firstDate = maxDate(window.from, series.validFrom);
  const lastDate = minDate(window.through, series.validThrough);
  if (firstDate > lastDate) return [];

  const excludedDates = new Set(series.excludedDates);
  const dates: string[] = [];

  for (
    let date = parseIsoDate(firstDate);
    date <= parseIsoDate(lastDate);
    date = addUtcDays(date, 1)
  ) {
    const isoDate = formatIsoDate(date);
    const isoWeekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();

    if (isoWeekday === series.weekday && !excludedDates.has(isoDate)) {
      dates.push(isoDate);
    }
  }

  return dates;
}

export function occurrenceId(seriesId: string, isoDate: string): string {
  return `${seriesId}-${isoDate}`;
}

function parseIsoDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function maxDate(windowDate: string, validityDate: string | null): string {
  return validityDate === null || windowDate >= validityDate
    ? windowDate
    : validityDate;
}

function minDate(windowDate: string, validityDate: string | null): string {
  return validityDate === null || windowDate <= validityDate
    ? windowDate
    : validityDate;
}
