import { describe, expect, it } from "vitest";

import automationState from "../data/automation-state.json";
import seriesRegistry from "../data/event-series.json";
import events from "../src/data/events.json";
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
      expectedProductionState(seriesRegistry, events, automationState),
    ).toEqual({
      reviewedAt: "2026-07-28T12:13:53+03:00",
      sentinelEventId: "takado-tuesday-open-mat-2026-09-22",
    });
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
