import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname } from "node:path";

import {
  AUTOMATION_LOCK_PATH,
  getAutomationGate,
  toHelsinkiIso,
  validateAutomationState,
  validatePublicationFreshness,
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
  it("uses one operating-system lock path shared by all worktrees", () => {
    expect(dirname(AUTOMATION_LOCK_PATH)).toBe(tmpdir());
    expect(basename(AUTOMATION_LOCK_PATH)).toBe("openmats-automation-run.lock");
  });

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

  it("rejects a stale publication window before recording success", () => {
    expect(() =>
      validatePublicationFreshness(
        {
          version: 1,
          checkedAt: "2026-07-28T12:00:00+03:00",
          window: {
            from: "2026-07-15",
            through: "2026-08-09",
            timezone: "Europe/Helsinki",
          },
          series: [],
        },
        new Date("2026-07-28T12:30:00+03:00"),
      ),
    ).toThrow(/must start today/);
  });

  it("accepts a freshly reviewed eight-week publication window", () => {
    const registry = {
      version: 1,
      checkedAt: "2026-07-28T12:00:00+03:00",
      window: {
        from: "2026-07-28",
        through: "2026-09-22",
        timezone: "Europe/Helsinki",
      },
      series: [
        {
          exceptionCheck: {
            checkedAt: "2026-07-28T11:45:00+03:00",
          },
        },
      ],
    };

    expect(
      validatePublicationFreshness(
        registry,
        new Date("2026-07-28T12:30:00+03:00"),
      ),
    ).toBe(registry);
  });
});
