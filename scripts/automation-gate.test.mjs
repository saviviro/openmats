import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";

import seriesRegistry from "../data/event-series.json";
import templates from "../data/event-templates.json";
import sourceRegistry from "../data/source-registry.json";
import events from "../src/data/events.json";
import {
  AUTOMATION_LOCK_PATH,
  acquireLock,
  getAutomationGate,
  parseGateArguments,
  releaseLock,
  toHelsinkiIso,
  validateAutomationState,
  validatePublicationFreshness,
  validatePublicationPackage,
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
  it("accepts the argument separator forwarded by pnpm", () => {
    expect(
      parseGateArguments(["--", "record", "routine", "owner-a", "summary"]),
    ).toEqual({
      command: "record",
      task: "routine",
      rest: ["owner-a", "summary"],
    });
  });

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

  it("validates the complete committed recurring and dated publication package", () => {
    expect(
      validatePublicationPackage(
        { seriesRegistry, sourceRegistry, templates, events },
        new Date("2026-07-28T12:30:00+03:00"),
      ),
    ).toEqual({ seriesRegistry, sourceRegistry, templates, events });
  });

  it("rejects a success record when published events are not synchronized", () => {
    expect(() =>
      validatePublicationPackage(
        {
          seriesRegistry,
          sourceRegistry,
          templates,
          events: events.slice(1),
        },
        new Date("2026-07-28T12:30:00+03:00"),
      ),
    ).toThrow(/do not match/);
  });

  it("requires every publication source to be reviewed after this run acquired the lock", () => {
    expect(() =>
      validatePublicationPackage(
        { seriesRegistry, sourceRegistry, templates, events },
        new Date("2026-07-28T12:30:00+03:00"),
        "2026-07-28T12:11:00+03:00",
      ),
    ).toThrow(/current automation run/);
  });

  it("allows only the run that acquired a lock to release it", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "openmats-lock-test-"));
    const path = resolve(directory, "lock");

    try {
      expect(
        acquireLock(
          "routine",
          new Date("2026-07-28T09:00:00Z"),
          path,
          "owner-a",
        ).acquired,
      ).toBe(true);
      expect(
        acquireLock(
          "routine",
          new Date("2026-07-28T09:01:00Z"),
          path,
          "owner-b",
        ).acquired,
      ).toBe(false);
      expect(releaseLock("routine", "owner-b", path)).toMatchObject({
        released: false,
        reason: "owned_by_other_run",
      });
      expect(releaseLock("discovery", "owner-a", path)).toMatchObject({
        released: false,
        reason: "owned_by_other_task",
      });
      expect(releaseLock("routine", "owner-a", path).released).toBe(true);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("recovers a stale or corrupted lock without letting its former owner remove the replacement", () => {
    const directory = mkdtempSync(resolve(tmpdir(), "openmats-lock-test-"));
    const path = resolve(directory, "lock");

    try {
      acquireLock(
        "routine",
        new Date("2026-07-28T00:00:00Z"),
        path,
        "old-owner",
      );
      const replacement = acquireLock(
        "routine",
        new Date("2026-07-28T09:00:01Z"),
        path,
        "new-owner",
      );
      expect(replacement).toMatchObject({
        acquired: true,
        reclaimedStaleLock: true,
        lock: { ownerId: "new-owner" },
      });
      expect(releaseLock("routine", "old-owner", path)).toMatchObject({
        released: false,
        reason: "owned_by_other_run",
      });
      expect(releaseLock("routine", "new-owner", path).released).toBe(true);

      writeFileSync(path, "{broken", "utf8");
      expect(
        acquireLock(
          "discovery",
          new Date("2026-07-28T10:00:00Z"),
          path,
          "recovery-owner",
        ),
      ).toMatchObject({
        acquired: true,
        reclaimedStaleLock: true,
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
