import { describe, expect, it } from "vitest";

import seriesData from "../../data/event-series.json";
import sourceRegistryData from "../../data/source-registry.json";
import eventsData from "../data/events.json";
import {
  materializeOccurrenceDates,
  occurrenceId,
  parseEventSeriesRegistry,
  type EventSeries,
} from "./event-series";

const registry = parseEventSeriesRegistry(seriesData);

const expectedSeriesDisplayData = {
  "aogg-sornainen-colored-belts-nogi-open-mat": {
    venueName: "Art of Ground Games Sörnäinen",
    formats: ["no-gi"],
    priceAmount: 0,
    status: "scheduled",
  },
  "aogg-erottaja-sunday-nogi-open-mat": {
    venueName: "Art of Ground Games Erottaja",
    formats: ["no-gi"],
    priceAmount: 0,
    status: "scheduled",
  },
  "buli-urhea-sunday-open-mat": {
    venueName: "Buli Jiu-Jitsu Urhea",
    formats: ["gi", "no-gi"],
    priceAmount: 25,
    status: "uncertain",
  },
  "hjjk-saturday-open-mat": {
    venueName: "Helsingin Ju-jutsuklubi",
    formats: ["gi", "no-gi"],
    priceAmount: null,
    status: "scheduled",
  },
  "hipko-metsala-saturday-bjj-open-mat": {
    venueName: "HIPKO Metsälä",
    formats: ["gi"],
    priceAmount: null,
    status: "uncertain",
  },
  "hipko-metsala-sunday-bjj-open-mat": {
    venueName: "HIPKO Metsälä",
    formats: ["gi"],
    priceAmount: null,
    status: "uncertain",
  },
  "tundra-saturday-open-mat": {
    venueName: "Tundra Jiu-Jitsu",
    formats: ["gi", "no-gi"],
    priceAmount: null,
    status: "uncertain",
  },
  "loop-saturday-open-mat": {
    venueName: "Loop Martial Arts",
    formats: ["gi", "no-gi"],
    priceAmount: 0,
    status: "scheduled",
  },
  "dojo-helsinki-saturday-nogi-open-mat": {
    venueName: "Dojo Helsinki",
    formats: ["no-gi"],
    priceAmount: null,
    status: "scheduled",
  },
  "kilo-jiu-jitsu-saturday-open-mat": {
    venueName: "Kilo Jiu-Jitsu",
    formats: null,
    priceAmount: null,
    status: "uncertain",
  },
  "mma-vantaa-sunday-open-mat": {
    venueName: "MMA Vantaa",
    formats: null,
    priceAmount: null,
    status: "scheduled",
  },
  "takado-tuesday-open-mat": {
    venueName: "Takado",
    formats: null,
    priceAmount: null,
    status: "scheduled",
  },
  "takado-saturday-open-mat": {
    venueName: "Takado",
    formats: null,
    priceAmount: null,
    status: "scheduled",
  },
  "tk-sports-saturday-open-mat": {
    venueName: "TK Sports",
    formats: null,
    priceAmount: null,
    status: "uncertain",
  },
} as const;

describe("event series materialization", () => {
  it("materializes weekly dates only inside the publication window", () => {
    const series = registry.series.find(
      ({ id }) => id === "hjjk-saturday-open-mat",
    );

    expect(series).toBeDefined();
    expect(
      materializeOccurrenceDates(series!, {
        ...registry.window,
        from: "2026-07-15",
        through: "2026-08-09",
      }),
    ).toEqual(["2026-07-18", "2026-07-25", "2026-08-01", "2026-08-08"]);
    expect(materializeOccurrenceDates(series!, registry.window)).toContain(
      "2026-08-22",
    );
  });

  it("honours validity boundaries and excluded exception dates", () => {
    const fixture: EventSeries = {
      ...registry.series[0],
      validFrom: "2026-07-20",
      validThrough: "2026-08-08",
      excludedDates: ["2026-08-01"],
    };

    expect(
      materializeOccurrenceDates(fixture, {
        ...registry.window,
        from: "2026-07-15",
        through: "2026-08-09",
      }),
    ).toEqual(["2026-07-25", "2026-08-08"]);
  });

  it("keeps MMA Vantaa bounded to its reviewed summer timetable", () => {
    const series = registry.series.find(
      ({ id }) => id === "mma-vantaa-sunday-open-mat",
    );

    expect(series?.publicationStatus).toBe("publish");
    expect(series?.validThrough).toBe("2026-08-09");
  });

  it("keeps Loop bounded to the reviewed summer timetable", () => {
    const series = registry.series.find(
      ({ id }) => id === "loop-saturday-open-mat",
    );

    expect(series?.publicationStatus).toBe("publish");
    expect(series?.validThrough).toBe("2026-08-02");
  });

  it("keeps the confirmed Dojo and Kilo Saturday slots distinct", () => {
    const dojo = registry.series.find(
      ({ id }) => id === "dojo-helsinki-saturday-nogi-open-mat",
    );
    const kilo = registry.series.find(
      ({ id }) => id === "kilo-jiu-jitsu-saturday-open-mat",
    );
    expect(dojo?.publicationStatus).toBe("publish");
    expect(kilo?.publicationStatus).toBe("publish_with_confirmation");
    expect(dojo?.weekday).toBe(6);
    expect(kilo?.weekday).toBe(6);
  });

  it("keeps both current Takado open mats", () => {
    const tuesday = registry.series.find(
      ({ id }) => id === "takado-tuesday-open-mat",
    );
    const saturday = registry.series.find(
      ({ id }) => id === "takado-saturday-open-mat",
    );

    expect(tuesday).toMatchObject({
      publicationStatus: "publish",
      weekday: 2,
      startTime: "16:30",
    });
    expect(saturday).toMatchObject({
      publicationStatus: "publish",
      weekday: 6,
      startTime: "11:00",
    });
  });

  it("keeps the TK Sports Saturday slot marked for confirmation", () => {
    const series = registry.series.find(
      ({ id }) => id === "tk-sports-saturday-open-mat",
    );

    expect(series?.publicationStatus).toBe("publish_with_confirmation");
    expect(series?.weekday).toBe(6);
  });

  it("keeps HIPKO weekend rows uncertain instead of inheriting other rows' member-only labels", () => {
    const saturday = registry.series.find(
      ({ id }) => id === "hipko-metsala-saturday-bjj-open-mat",
    );
    const sunday = registry.series.find(
      ({ id }) => id === "hipko-metsala-sunday-bjj-open-mat",
    );

    expect(saturday?.publicationStatus).toBe("publish_with_confirmation");
    expect(sunday?.publicationStatus).toBe("publish_with_confirmation");
    expect(saturday?.validThrough).toBe("2026-08-09");
    expect(sunday?.validThrough).toBe("2026-08-09");
    expect(saturday?.exceptionCheck.notes).toMatch(
      /member-only wording belongs to other timetable rows/i,
    );
    expect(sunday?.exceptionCheck.notes).toMatch(
      /member-only wording belongs to other timetable rows/i,
    );
  });

  it("keeps only the publishable AOGG visitor series", () => {
    const erottaja = registry.series.find(
      ({ id }) => id === "aogg-erottaja-sunday-nogi-open-mat",
    );
    const sornainen = registry.series.find(
      ({ id }) => id === "aogg-sornainen-colored-belts-nogi-open-mat",
    );

    expect(erottaja?.publicationStatus).toBe("publish");
    expect(sornainen?.publicationStatus).toBe("publish");
  });

  it("materializes Buli with confirmation while its calendars disagree", () => {
    const series = registry.series.find(
      ({ id }) => id === "buli-urhea-sunday-open-mat",
    );

    expect(series?.venueId).toBe("buli-urhea");
    expect(series?.publicationStatus).toBe("publish_with_confirmation");
  });

  it("references existing source-registry venues", () => {
    const venueIds = new Set(sourceRegistryData.venues.map(({ id }) => id));

    for (const series of registry.series) {
      expect(venueIds.has(series.venueId), series.id).toBe(true);
    }
  });

  it("rejects a publication status that contradicts its source check", () => {
    expect(() =>
      parseEventSeriesRegistry({
        ...seriesData,
        series: [
          {
            ...seriesData.series[0],
            publicationStatus: "blocked_conflicting_source",
          },
        ],
      }),
    ).toThrow(/must match its exception-check result/);
  });

  it("requires source evidence for every excluded date", () => {
    expect(() =>
      parseEventSeriesRegistry({
        ...seriesData,
        series: seriesData.series.map((series) =>
          series.id === "hjjk-saturday-open-mat"
            ? { ...series, excludedDates: ["2026-08-22"] }
            : series,
        ),
      }),
    ).toThrow(/matching source-evidence record/);
  });

  it("keeps series identifiers unique", () => {
    expect(new Set(registry.series.map(({ id }) => id)).size).toBe(
      registry.series.length,
    );
  });

  it("keeps recurring checked-in events aligned with publishable series", () => {
    const expectedIds = registry.series.flatMap((series) =>
      materializeOccurrenceDates(series, registry.window).map((date) =>
        occurrenceId(series.id, date),
      ),
    );
    const recurringSeriesIds = new Set(registry.series.map(({ id }) => id));
    const actualIds = eventsData
      .filter(({ schedule }) => recurringSeriesIds.has(schedule.seriesId))
      .map(({ id }) => id);

    expect(actualIds.sort()).toEqual(expectedIds.sort());
  });

  it("keeps every recurring occurrence aligned with its reviewed series data", () => {
    for (const series of registry.series) {
      const expectedDisplay =
        expectedSeriesDisplayData[
          series.id as keyof typeof expectedSeriesDisplayData
        ];
      const occurrenceDates = materializeOccurrenceDates(
        series,
        registry.window,
      );

      if (series.publicationStatus === "blocked_conflicting_source") {
        expect(expectedDisplay).toBeUndefined();
        continue;
      }

      expect(
        expectedDisplay,
        `${series.id} needs reviewed display data`,
      ).toBeDefined();

      for (const date of occurrenceDates) {
        const id = occurrenceId(series.id, date);
        const event = eventsData.find((candidate) => candidate.id === id);

        expect(event, `${id} must exist`).toBeDefined();
        expect(event?.schedule.seriesId).toBe(series.id);
        expect(event?.startAt).toMatch(
          new RegExp(`^${date}T${series.startTime}:00[+-]\\d{2}:\\d{2}$`),
        );
        expect(event?.endAt).toMatch(
          new RegExp(`^${date}T${series.endTime}:00[+-]\\d{2}:\\d{2}$`),
        );
        expect(event?.schedule.validFrom).toBe(series.validFrom);
        expect(event?.schedule.validThrough).toBe(series.validThrough);
        expect(event?.schedule.materializedThrough).toBe(
          registry.window.through,
        );
        expect(event?.schedule.exceptionStatus).toBe(
          series.publicationStatus === "publish_with_confirmation"
            ? "confirmation_required"
            : "none_found",
        );
        expect(event?.venue.name).toBe(expectedDisplay?.venueName);
        expect(event?.formats).toEqual(expectedDisplay?.formats);
        expect(event?.price.amount).toBe(expectedDisplay?.priceAmount);
        expect(event?.status).toBe(expectedDisplay?.status);
      }
    }
  });
});
