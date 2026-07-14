import { describe, expect, it } from "vitest";

import registryData from "../../data/source-registry.json";
import { REGION_CITIES, parseSourceRegistry } from "./source-registry";

const registry = parseSourceRegistry(registryData);

describe("source registry", () => {
  it("matches the documented schema", () => {
    expect(registry.timezone).toBe("Europe/Helsinki");
    expect(registry.venues.length).toBeGreaterThan(0);
  });

  it("has one coverage record for every city in scope", () => {
    expect(registry.coverage.map(({ city }) => city).sort()).toEqual(
      [...REGION_CITIES].sort(),
    );
  });

  it("keeps venue identifiers and source URLs unique within each record", () => {
    const ids = registry.venues.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const venue of registry.venues) {
      const urls = venue.sources.map(({ url }) => url);
      expect(new Set(urls).size, venue.id).toBe(urls.length);
    }
  });

  it("keeps coverage counts aligned with venue records", () => {
    for (const coverage of registry.coverage) {
      const venues = registry.venues.filter(
        ({ city }) => city === coverage.city,
      );
      expect(
        venues.filter(({ status }) => status === "active"),
        coverage.city,
      ).toHaveLength(coverage.activeVenueCount);
      expect(
        venues.filter(({ status }) => status === "planned"),
        coverage.city,
      ).toHaveLength(coverage.plannedVenueCount);
    }
  });

  it("only marks public candidates ready for event review", () => {
    for (const venue of registry.venues) {
      for (const candidate of venue.candidateOpenMats) {
        if (candidate.publishStatus === "ready_for_event_review") {
          expect(
            ["public_confirmed", "public_with_conditions", "mixed"],
            venue.id,
          ).toContain(venue.openMatAccess);
        }
      }
    }
  });

  it("does not silently omit Kauniainen when no venue is found", () => {
    const kauniainen = registry.coverage.find(
      ({ city }) => city === "Kauniainen",
    );

    expect(kauniainen).toMatchObject({
      status: "searched_no_active_venue_found",
      activeVenueCount: 0,
      plannedVenueCount: 0,
    });
  });
});
