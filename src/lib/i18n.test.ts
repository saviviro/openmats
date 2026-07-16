import { describe, expect, it } from "vitest";

import events from "../data/events.json";
import {
  englishEventTranslationOverrides,
  englishSeriesTranslations,
  getEventTranslation,
  ui,
  type EventTranslation,
} from "./i18n";

describe("localization", () => {
  it("has an English translation for every published event series", () => {
    const publishedSeries = [
      ...new Set(events.map((event) => event.schedule.seriesId)),
    ].sort();

    expect(Object.keys(englishSeriesTranslations).sort()).toEqual(
      publishedSeries,
    );
  });

  it("keeps Finnish source text unchanged and resolves English by series", () => {
    const finnish = {
      priceNote: "Maksuton",
      accessDescription: "Avoin kaikille.",
      exceptionNote: "Ei tiedossa olevia poikkeuksia.",
    };

    expect(getEventTranslation("fi", "event-id", "anything", finnish)).toBe(
      finnish,
    );
    expect(
      getEventTranslation(
        "en",
        "gb-gym-monthly-open-mat-2026-08-30",
        "gb-gym-monthly-open-mat",
        finnish,
      ),
    ).toEqual({
      priceNote: "Free of charge",
      accessDescription: "Open to all practitioners. Gi or no-gi.",
      exceptionNote: "No known exceptions.",
    });
  });

  it("requires event-specific English overrides when Finnish source text varies inside a series", () => {
    const fields = [
      ["priceNote", (event: (typeof events)[number]) => event.price.note],
      [
        "accessDescription",
        (event: (typeof events)[number]) => event.access.description,
      ],
      [
        "exceptionNote",
        (event: (typeof events)[number]) => event.schedule.exceptionNote,
      ],
    ] as const satisfies ReadonlyArray<
      readonly [
        keyof EventTranslation,
        (event: (typeof events)[number]) => string,
      ]
    >;
    const eventsBySeries = Map.groupBy(
      events,
      (event) => event.schedule.seriesId,
    );

    for (const seriesEvents of eventsBySeries.values()) {
      for (const [field, getFinnishText] of fields) {
        const variants = new Set(seriesEvents.map(getFinnishText));
        if (variants.size <= 1) continue;

        for (const event of seriesEvents) {
          expect(
            englishEventTranslationOverrides[event.id]?.[field],
            `${event.id} needs an English ${field} override`,
          ).toBeDefined();
        }
      }
    }
  });

  it("contains the same interface keys in both languages", () => {
    expect(Object.keys(ui.en).sort()).toEqual(Object.keys(ui.fi).sort());
  });
});
