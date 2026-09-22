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

  it("keeps the HJJK venue-specific exception accurate in English", () => {
    const translation = getEventTranslation(
      "en",
      "hjjk-saturday-open-mat-2026-08-22",
      "hjjk-saturday-open-mat",
      {
        priceNote: "Vierailuhintaa ei ilmoitettu lähteessä",
        accessDescription: "Avoin muiden seurojen harrastajille.",
        exceptionNote: "Suomenkielinen poikkeusteksti.",
      },
    );

    expect(translation.exceptionNote).toMatch(/Kaapelitehdas venue/);
    expect(translation.exceptionNote).toMatch(/no other event uses/);
    expect(translation.exceptionNote).toMatch(/10 and 31 October/);
    expect(translation.exceptionNote).not.toMatch(/No-Gi Finnish Open/);
  });

  it("keeps the Dojo seminar warning accurate in English", () => {
    const translation = getEventTranslation(
      "en",
      "dojo-helsinki-saturday-nogi-open-mat-2026-09-26",
      "dojo-helsinki-saturday-nogi-open-mat",
      {
        priceNote: "Vierailuhintaa ei ilmoitettu lähteessä",
        accessDescription: "Avoin muiden seurojen harrastajille.",
        exceptionNote: "Suomenkielinen poikkeusteksti.",
      },
    );

    expect(translation.exceptionNote).toMatch(/26 September/);
    expect(translation.exceptionNote).toMatch(/Aki Teräväinen seminar/);
    expect(translation.exceptionNote).toMatch(/does not confirm the venue/);
  });

  it("keeps the Buli reviewed date range accurate in English", () => {
    const translation = getEventTranslation(
      "en",
      "buli-urhea-sunday-open-mat-2026-11-15",
      "buli-urhea-sunday-open-mat",
      {
        priceNote: "Open mat -jäsenyys 25 € / kalenterivuosi",
        accessDescription: "Ota yhteyttä etukäteen.",
        exceptionNote: "Suomenkielinen poikkeusteksti.",
      },
    );

    expect(translation.exceptionNote).toMatch(/through 15 November/);
    expect(translation.exceptionNote).toMatch(/ends on 13 December 2026/);
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
