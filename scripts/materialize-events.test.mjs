import { describe, expect, it } from "vitest";

import seriesData from "../data/event-series.json";
import templatesData from "../data/event-templates.json";
import sourceRegistryData from "../data/source-registry.json";
import eventsData from "../src/data/events.json";
import {
  PUBLICATION_HORIZON_DAYS,
  addIsoDays,
  buildPublishedEvents,
  helsinkiOffset,
} from "./materialize-events.mjs";

describe("event materialization", () => {
  it("uses an eight-week rolling publication horizon", () => {
    expect(addIsoDays("2026-07-28", PUBLICATION_HORIZON_DAYS)).toBe(
      "2026-09-22",
    );
  });

  it("uses Helsinki daylight-saving offsets for each occurrence", () => {
    expect(helsinkiOffset("2026-10-24", "12:00")).toBe("+03:00");
    expect(helsinkiOffset("2026-10-25", "12:00")).toBe("+02:00");
  });

  it("rebuilds the published file entirely from canonical source data", () => {
    expect(
      buildPublishedEvents(seriesData, templatesData, sourceRegistryData),
    ).toEqual(eventsData);
  });

  it("removes every occurrence when a recurring series is removed", () => {
    const removedSeriesId = "aogg-erottaja-sunday-nogi-open-mat";
    const registry = {
      ...seriesData,
      series: seriesData.series.filter(({ id }) => id !== removedSeriesId),
    };
    const templates = {
      ...templatesData,
      templates: templatesData.templates.filter(
        ({ seriesId }) => seriesId !== removedSeriesId,
      ),
    };

    expect(
      buildPublishedEvents(registry, templates, sourceRegistryData).some(
        ({ schedule }) => schedule.seriesId === removedSeriesId,
      ),
    ).toBe(false);
  });

  it("materializes and cancels exact dated events from the source registry", () => {
    const registryWithExtraDate = structuredClone(sourceRegistryData);
    const gbGym = registryWithExtraDate.venues.find(
      ({ id }) => id === "gb-gym-herttoniemi",
    );
    gbGym.datedOpenMats.push({
      ...gbGym.datedOpenMats[0],
      date: "2027-01-31",
    });

    const withExtraDate = buildPublishedEvents(
      seriesData,
      templatesData,
      registryWithExtraDate,
    );
    expect(
      withExtraDate.some(
        ({ id }) => id === "gb-gym-monthly-open-mat-2027-01-31",
      ),
    ).toBe(true);

    gbGym.datedOpenMats.at(-1).status = "cancelled";
    gbGym.datedOpenMats.at(-1).publishStatus = "cancelled_do_not_publish";
    expect(
      buildPublishedEvents(
        seriesData,
        templatesData,
        registryWithExtraDate,
      ).some(({ id }) => id === "gb-gym-monthly-open-mat-2027-01-31"),
    ).toBe(false);
  });

  it("keeps exact dated events while another recurring series is removed", () => {
    const removedSeriesId = "hjjk-saturday-open-mat";
    const registry = {
      ...seriesData,
      series: seriesData.series.filter(({ id }) => id !== removedSeriesId),
    };
    const templates = {
      ...templatesData,
      templates: templatesData.templates.filter(
        ({ seriesId }) => seriesId !== removedSeriesId,
      ),
    };

    const events = buildPublishedEvents(
      registry,
      templates,
      sourceRegistryData,
    );
    expect(
      events.filter(
        ({ schedule }) => schedule.seriesId === "gb-gym-monthly-open-mat",
      ),
    ).toHaveLength(4);
  });

  it("generates a date-specific AOGG booking link for every occurrence", () => {
    const events = buildPublishedEvents(
      seriesData,
      templatesData,
      sourceRegistryData,
    ).filter(({ schedule }) => schedule.seriesId.startsWith("aogg-"));

    for (const event of events) {
      const source = new URL(event.sourceUrl);
      expect(source.searchParams.get("date")).toBe(event.startAt.slice(0, 10));
      expect(source.searchParams.get("s")).toMatch(/^(1399909|1403054)$/);
    }
  });

  it("publishes HJJK on 22 August because the reviewed competition is in Vantaa", () => {
    expect(
      buildPublishedEvents(seriesData, templatesData, sourceRegistryData).some(
        ({ id }) => id === "hjjk-saturday-open-mat-2026-08-22",
      ),
    ).toBe(true);
  });

  it("rejects a display template without a canonical recurring or dated series", () => {
    expect(() =>
      buildPublishedEvents(
        seriesData,
        {
          ...templatesData,
          templates: [
            ...templatesData.templates,
            {
              ...templatesData.templates[0],
              seriesId: "invented-orphan",
            },
          ],
        },
        sourceRegistryData,
      ),
    ).toThrow(/no canonical series/);
  });

  it("rejects a canonical template that would generate invalid event content", () => {
    expect(() =>
      buildPublishedEvents(
        seriesData,
        {
          ...templatesData,
          templates: templatesData.templates.map((template) =>
            template.seriesId === "hjjk-saturday-open-mat"
              ? {
                  ...template,
                  venue: { ...template.venue, postalCode: "invalid" },
                }
              : template,
          ),
        },
        sourceRegistryData,
      ),
    ).toThrow(/postalCode/);
  });
});
