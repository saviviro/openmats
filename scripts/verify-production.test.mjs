import { describe, expect, it } from "vitest";

import fixture from "../tests/fixtures/production-verification.json";
import {
  expectedProductionState,
  inspectProductionHtml,
  parseArguments,
} from "./verify-production.mjs";

describe("production verification", () => {
  it("accepts the argument separator forwarded by pnpm", () => {
    expect(
      parseArguments([
        "--",
        "--commit",
        "abc123",
        "--attempts",
        "2",
        "--delay-ms",
        "0",
      ]),
    ).toMatchObject({
      commit: "abc123",
      attempts: 2,
      delayMs: 0,
    });
  });

  it("selects the latest complete review and a rolling-window sentinel", () => {
    expect(
      expectedProductionState(
        fixture.seriesRegistry,
        fixture.events,
        fixture.automationState,
      ),
    ).toEqual({
      reviewedAt: "2026-12-20T15:00:00+02:00",
      sentinelEventId: "recurring-a-2026-12-20",
    });
  });

  it("selects the new sentinel when the publication window moves", () => {
    const seriesRegistry = {
      ...fixture.seriesRegistry,
      window: { through: "2026-12-27" },
    };

    expect(
      expectedProductionState(
        seriesRegistry,
        fixture.events,
        fixture.automationState,
      ).sentinelEventId,
    ).toBe("recurring-b-2026-12-27");
  });

  it("compares review timestamps chronologically across the Helsinki DST change", () => {
    const state = {
      routine: { lastSuccessfulAt: "2026-10-25T03:45:00+03:00" },
      discovery: { lastSuccessfulAt: "2026-10-25T03:15:00+02:00" },
    };

    expect(
      expectedProductionState(fixture.seriesRegistry, fixture.events, state)
        .reviewedAt,
    ).toBe("2026-10-25T03:15:00+02:00");
  });

  it("requires the review marker, rolling event, and expected build commit", () => {
    const expected = {
      reviewedAt: "2026-07-28T12:13:53+03:00",
      sentinelEventId: "takado-tuesday-open-mat-2026-09-22",
      commit: "abc123",
    };
    const html = `
      <meta name="build-commit" content="abc123">
      <aside data-last-reviewed-at="2026-07-28T12:13:53+03:00"></aside>
      <article data-event-id="takado-tuesday-open-mat-2026-09-22"></article>
    `;

    expect(inspectProductionHtml(html, expected)).toEqual({
      ok: true,
      checks: { reviewedAt: true, sentinelEvent: true, commit: true },
    });
    expect(
      inspectProductionHtml(html.replace("abc123", "stale"), expected),
    ).toEqual({
      ok: false,
      checks: { reviewedAt: true, sentinelEvent: true, commit: false },
    });
  });
});
