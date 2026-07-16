import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  getAutomationGate,
  toHelsinkiIso,
  validateAutomationState,
} from "./automation-gate.mjs";

const state = {
  version: 1,
  routine: {
    lastSuccessfulAt: "2026-07-16T13:17:00+03:00",
    summary: "Routine sources checked.",
  },
  discovery: {
    lastSuccessfulAt: "2026-07-14T15:00:54+03:00",
    summary: "Broad discovery completed.",
  },
};

describe("scheduled automation gate", () => {
  it("accepts the committed project state", () => {
    const projectState = JSON.parse(
      readFileSync(new URL("../data/automation-state.json", import.meta.url)),
    );

    expect(validateAutomationState(projectState)).toEqual(projectState);
  });

  it("opens the routine gate only after 168 hours", () => {
    const beforeDue = getAutomationGate(
      "routine",
      state,
      new Date("2026-07-23T13:16:59+03:00"),
    );

    expect(beforeDue.due).toBe(false);
    expect(beforeDue.dueAt).toBe("2026-07-23T13:17:00+03:00");
    expect(
      getAutomationGate("routine", state, new Date("2026-07-23T13:17:00+03:00"))
        .due,
    ).toBe(true);
  });

  it("opens the discovery gate only after 28 days", () => {
    expect(
      getAutomationGate(
        "discovery",
        state,
        new Date("2026-08-11T15:00:53+03:00"),
      ).due,
    ).toBe(false);
    expect(
      getAutomationGate(
        "discovery",
        state,
        new Date("2026-08-11T15:00:54+03:00"),
      ).due,
    ).toBe(true);
  });

  it("formats summer and winter timestamps in Helsinki local time", () => {
    expect(toHelsinkiIso(new Date("2026-07-16T10:17:00Z"))).toBe(
      "2026-07-16T13:17:00+03:00",
    );
    expect(toHelsinkiIso(new Date("2026-12-16T10:17:00Z"))).toBe(
      "2026-12-16T12:17:00+02:00",
    );
  });

  it("rejects incomplete state instead of guessing from event timestamps", () => {
    expect(() =>
      validateAutomationState({
        version: 1,
        routine: state.routine,
      }),
    ).toThrow(/invalid discovery entry/);
  });
});
