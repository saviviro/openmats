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
      title: "Open mat",
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
      title: "Open mat",
      priceNote: "Free of charge",
      accessDescription: "Open to all practitioners. Gi or no-gi.",
      exceptionNote: "No known exceptions.",
    });
  });

  it("localizes the women's event title while preserving the Finnish title", () => {
    const finnish = {
      title: "Naisten open mat",
      priceNote: "Maksuton",
      accessDescription: "Avoin naisharrastajille.",
      exceptionNote: "Tarkista päivät järjestäjältä.",
    };
    const eventId = "hipko-metsala-women-open-mat-autumn-2026-2026-11-29";
    const seriesId = "hipko-metsala-women-open-mat-autumn-2026";

    expect(getEventTranslation("fi", eventId, seriesId, finnish).title).toBe(
      "Naisten open mat",
    );
    expect(getEventTranslation("en", eventId, seriesId, finnish).title).toBe(
      "Women's open mat",
    );
  });

  it("keeps the HJJK venue-specific exception accurate in English", () => {
    const translation = getEventTranslation(
      "en",
      "hjjk-saturday-open-mat-2026-08-22",
      "hjjk-saturday-open-mat",
      {
        title: "Open mat",
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

  it("keeps the confirmed Dojo details current in English", () => {
    const translation = getEventTranslation(
      "en",
      "dojo-helsinki-saturday-nogi-open-mat-2026-10-10",
      "dojo-helsinki-saturday-nogi-open-mat",
      {
        title: "Open mat",
        priceNote: "Vierailuhintaa ei ilmoitettu lähteessä",
        accessDescription: "Avoin muiden seurojen harrastajille.",
        exceptionNote: "Suomenkielinen poikkeusteksti.",
      },
    );

    expect(translation.priceNote).toBe("Free of charge");
    expect(translation.accessDescription).toMatch(
      /all clubs and experience levels/,
    );
    expect(translation.exceptionNote).toMatch(/no exceptions/);
    expect(translation.exceptionNote).toMatch(/12:00–13:00/);
    expect(translation.exceptionNote).not.toMatch(/September|seminar/);
  });

  it("requires event-specific English overrides when Finnish source text varies inside a series", () => {
    const fields = [
      ["title", (event: (typeof events)[number]) => event.title],
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
