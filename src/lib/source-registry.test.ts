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
      for (const candidate of [
        ...venue.candidateOpenMats,
        ...venue.datedOpenMats,
      ]) {
        if (candidate.publishStatus === "ready_for_event_review") {
          expect(
            ["public_confirmed", "public_with_conditions", "mixed"],
            venue.id,
          ).toContain(venue.openMatAccess);
          if (candidate.disciplines.length === 0) {
            expect(candidate.notes, venue.id).toMatch(/not stated|unverified/i);
          }
        }
      }
    }
  });

  it("keeps dated open mats unique and cancellations out of publication", () => {
    for (const venue of registry.venues) {
      const identities = venue.datedOpenMats.map(
        ({ date, startTime }) => `${date}-${startTime}`,
      );
      expect(new Set(identities).size, venue.id).toBe(identities.length);

      for (const openMat of venue.datedOpenMats) {
        if (openMat.status === "cancelled") {
          expect(openMat.publishStatus, venue.id).toBe(
            "cancelled_do_not_publish",
          );
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

  it("keeps the Buli open mat attached to Urhea, not Konepaja", () => {
    const konepaja = registry.venues.find(({ id }) => id === "buli-konepaja");
    const urhea = registry.venues.find(({ id }) => id === "buli-urhea");

    expect(konepaja?.candidateOpenMats).toHaveLength(0);
    expect(urhea).toMatchObject({
      venueName: "Urhea",
      openMatAccess: "public_with_conditions",
      collectionReadiness: "manual_review",
    });
    expect(urhea?.candidateOpenMats).toEqual([
      expect.objectContaining({
        weekday: 7,
        startTime: "12:00",
        endTime: "13:30",
        publishStatus: "blocked_by_source_conflict",
      }),
    ]);
  });

  it("keeps the audited public visitor sessions publishable", () => {
    const erottaja = registry.venues.find(({ id }) => id === "aogg-erottaja");
    const sornainen = registry.venues.find(({ id }) => id === "aogg-sornainen");
    const kivenlahti = registry.venues.find(
      ({ id }) => id === "aogg-kivenlahti",
    );
    const mmaVantaa = registry.venues.find(
      ({ id }) => id === "mma-vantaa-martinlaakso",
    );
    const loop = registry.venues.find(({ id }) => id === "loop-pitajanmaki");
    const dojo = registry.venues.find(
      ({ id }) => id === "dojo-helsinki-punavuori",
    );
    const kilo = registry.venues.find(({ id }) => id === "kilo-jiu-jitsu-kilo");

    expect(erottaja?.candidateOpenMats[0]).toMatchObject({
      weekday: 7,
      startTime: "12:00",
      endTime: "14:00",
      disciplines: ["nogi"],
      publishStatus: "ready_for_event_review",
    });
    expect(sornainen?.candidateOpenMats[0]).toMatchObject({
      weekday: 6,
      startTime: "12:00",
      endTime: "14:00",
      disciplines: ["nogi"],
      publishStatus: "ready_for_event_review",
    });
    expect(kivenlahti?.candidateOpenMats).toHaveLength(0);
    expect(mmaVantaa).toMatchObject({
      collectionReadiness: "ready",
      candidateOpenMats: [
        expect.objectContaining({
          startTime: "12:00",
          endTime: "13:30",
          publishStatus: "ready_for_event_review",
        }),
      ],
    });
    expect(loop).toMatchObject({
      openMatAccess: "public_confirmed",
      collectionReadiness: "ready",
      candidateOpenMats: [
        expect.objectContaining({
          weekday: 6,
          startTime: "10:30",
          endTime: "12:00",
          disciplines: ["bjj", "nogi"],
          publishStatus: "ready_for_event_review",
          validThrough: "2026-08-02",
        }),
      ],
    });
    expect(dojo).toMatchObject({
      openMatAccess: "public_confirmed",
      collectionReadiness: "ready",
      candidateOpenMats: [
        expect.objectContaining({
          startTime: "12:00",
          endTime: "13:00",
          disciplines: ["nogi"],
          publishStatus: "ready_for_event_review",
        }),
      ],
    });
    expect(kilo).toMatchObject({
      openMatAccess: "public_confirmed",
      collectionReadiness: "ready",
      candidateOpenMats: [
        expect.objectContaining({
          startTime: "11:00",
          endTime: "12:30",
          disciplines: [],
          publishStatus: "ready_for_event_review",
        }),
      ],
    });
  });

  it("rejects event candidates on a venue marked without an open mat", () => {
    const urhea = registryData.venues.find(({ id }) => id === "buli-urhea")!;

    expect(() =>
      parseSourceRegistry({
        ...registryData,
        venues: [
          ...registryData.venues.filter(({ id }) => id !== "buli-urhea"),
          { ...urhea, openMatAccess: "no_open_mat_found" },
        ],
      }),
    ).toThrow(/must not retain event candidates/);
  });
});
