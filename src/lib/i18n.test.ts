import { describe, expect, it } from "vitest";

import events from "../data/events.json";
import { englishEventTranslations, getEventTranslation, ui } from "./i18n";

describe("localization", () => {
  it("has an English translation for every published event series", () => {
    const publishedSeries = [
      ...new Set(events.map((event) => event.schedule.seriesId)),
    ].sort();

    expect(Object.keys(englishEventTranslations).sort()).toEqual(
      publishedSeries,
    );
  });

  it("keeps Finnish source text unchanged and resolves English by series", () => {
    const finnish = {
      priceNote: "Maksuton",
      accessDescription: "Avoin kaikille.",
      exceptionNote: "Ei tiedossa olevia poikkeuksia.",
    };

    expect(getEventTranslation("fi", "anything", finnish)).toBe(finnish);
    expect(
      getEventTranslation("en", "gb-gym-monthly-open-mat", finnish),
    ).toEqual({
      priceNote: "Free of charge",
      accessDescription: "Open to all practitioners. Gi or no-gi.",
      exceptionNote: "No known exceptions.",
    });
  });

  it("contains the same interface keys in both languages", () => {
    expect(Object.keys(ui.en).sort()).toEqual(Object.keys(ui.fi).sort());
  });
});
