#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildPublishedEvents } from "./materialize-events.mjs";

export const AUTOMATION_INTERVAL_HOURS = Object.freeze({
  routine: 168,
  discovery: 28 * 24,
});

export const LOCK_MAX_AGE_HOURS = 8;
export const PUBLICATION_REVIEW_MAX_AGE_HOURS = 36;
export const MIN_PUBLICATION_HORIZON_DAYS = 56;
export const AUTOMATION_LOCK_PATH = resolve(
  tmpdir(),
  "openmats-automation-run.lock",
);

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const statePath = resolve(repositoryRoot, "data/automation-state.json");
const eventSeriesPath = resolve(repositoryRoot, "data/event-series.json");
const eventTemplatesPath = resolve(repositoryRoot, "data/event-templates.json");
const sourceRegistryPath = resolve(repositoryRoot, "data/source-registry.json");
const publishedEventsPath = resolve(repositoryRoot, "src/data/events.json");
const lockPath = AUTOMATION_LOCK_PATH;

export function validateAutomationState(state) {
  if (!state || typeof state !== "object" || state.version !== 1) {
    throw new Error("Automation state must have version 1");
  }

  for (const task of Object.keys(AUTOMATION_INTERVAL_HOURS)) {
    const entry = state[task];
    if (
      !entry ||
      typeof entry.lastSuccessfulAt !== "string" ||
      !Number.isFinite(Date.parse(entry.lastSuccessfulAt)) ||
      typeof entry.summary !== "string" ||
      entry.summary.trim().length === 0
    ) {
      throw new Error(`Automation state has an invalid ${task} entry`);
    }
  }

  return state;
}

export function getAutomationGate(task, state, now = Date.now()) {
  assertTask(task);
  validateAutomationState(state);

  const nowTime = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(nowTime)) throw new Error("Invalid current time");

  const lastSuccessfulAt = state[task].lastSuccessfulAt;
  const dueAtTime =
    Date.parse(lastSuccessfulAt) + AUTOMATION_INTERVAL_HOURS[task] * 3_600_000;

  return {
    task,
    due: nowTime >= dueAtTime,
    lastSuccessfulAt,
    dueAt: toHelsinkiIso(new Date(dueAtTime)),
    checkedAt: toHelsinkiIso(new Date(nowTime)),
  };
}

export function toHelsinkiIso(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
  const localAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offsetMinutes = Math.round((localAsUtc - date.getTime()) / 60_000);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const offsetRemainder = String(absoluteOffset % 60).padStart(2, "0");

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${sign}${offsetHours}:${offsetRemainder}`;
}

export function validatePublicationFreshness(
  registry,
  now = new Date(),
  reviewStartedAt = null,
) {
  const nowDate = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(nowDate.getTime()))
    throw new Error("Invalid current time");
  if (!registry || registry.version !== 1 || !Array.isArray(registry.series)) {
    throw new Error("Event series registry must have version 1");
  }

  const today = toHelsinkiIso(nowDate).slice(0, 10);
  const minimumThrough = addIsoDays(today, MIN_PUBLICATION_HORIZON_DAYS);
  if (registry.window?.from !== today) {
    throw new Error(
      `Publication window must start today (${today}); run pnpm events:refresh`,
    );
  }
  if (registry.window?.through < minimumThrough) {
    throw new Error(
      `Publication window must extend through at least ${minimumThrough}; run pnpm events:refresh`,
    );
  }

  const reviewedAt = [
    registry.checkedAt,
    ...registry.series.map(({ exceptionCheck }) => exceptionCheck?.checkedAt),
  ];
  for (const timestamp of reviewedAt) {
    const age = nowDate.getTime() - Date.parse(timestamp);
    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > PUBLICATION_REVIEW_MAX_AGE_HOURS * 3_600_000
    ) {
      throw new Error(
        "Every published series must have a fresh source and exception review before recording success",
      );
    }
    if (
      reviewStartedAt !== null &&
      Date.parse(timestamp) < Date.parse(reviewStartedAt)
    ) {
      throw new Error(
        "Every published series must be reviewed after the current automation run acquired its lock",
      );
    }
  }

  return registry;
}

export function validatePublicationPackage(
  { seriesRegistry, sourceRegistry, templates, events },
  now = new Date(),
  reviewStartedAt = null,
) {
  validatePublicationFreshness(seriesRegistry, now, reviewStartedAt);
  if (
    !sourceRegistry ||
    sourceRegistry.version !== 1 ||
    !Array.isArray(sourceRegistry.venues)
  ) {
    throw new Error("Source registry must have version 1");
  }

  const relevantVenueIds = new Set([
    ...seriesRegistry.series.map(({ venueId }) => venueId),
    ...sourceRegistry.venues
      .filter(({ datedOpenMats }) => (datedOpenMats ?? []).length > 0)
      .map(({ id }) => id),
  ]);
  const sourceTimestamps = [
    sourceRegistry.checkedAt,
    ...sourceRegistry.venues
      .filter(({ id }) => relevantVenueIds.has(id))
      .map(({ checkedAt }) => checkedAt),
  ];
  const nowDate = now instanceof Date ? now : new Date(now);
  for (const timestamp of sourceTimestamps) {
    const age = nowDate.getTime() - Date.parse(timestamp);
    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > PUBLICATION_REVIEW_MAX_AGE_HOURS * 3_600_000
    ) {
      throw new Error(
        "Every published recurring and dated source must have a fresh review before recording success",
      );
    }
    if (
      reviewStartedAt !== null &&
      Date.parse(timestamp) < Date.parse(reviewStartedAt)
    ) {
      throw new Error(
        "Every published recurring and dated source must be reviewed during the current automation run",
      );
    }
  }

  const expectedEvents = buildPublishedEvents(
    seriesRegistry,
    templates,
    sourceRegistry,
  );
  if (JSON.stringify(expectedEvents) !== JSON.stringify(events)) {
    throw new Error(
      "Published events do not match the reviewed recurring and dated source data",
    );
  }

  return { seriesRegistry, sourceRegistry, templates, events };
}

function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function readState() {
  return validateAutomationState(JSON.parse(readFileSync(statePath, "utf8")));
}

function readLock(targetLockPath = lockPath) {
  try {
    return JSON.parse(readFileSync(targetLockPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    if (error instanceof SyntaxError) {
      return { invalid: true };
    }
    throw error;
  }
}

export function acquireLock(
  task,
  now = new Date(),
  targetLockPath = lockPath,
  ownerId = randomUUID(),
) {
  assertTask(task);
  const existingLock = readLock(targetLockPath);

  if (existingLock) {
    const age = now.getTime() - Date.parse(existingLock.acquiredAt);
    const stale =
      existingLock.invalid === true ||
      !Number.isFinite(age) ||
      age > LOCK_MAX_AGE_HOURS * 3_600_000;
    if (!stale) {
      return {
        acquired: false,
        task,
        lockPath: targetLockPath,
        stale: false,
        existingLock,
      };
    }

    try {
      unlinkSync(targetLockPath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  const lock = {
    version: 1,
    task,
    ownerId,
    acquiredAt: now.toISOString(),
    heartbeatAt: now.toISOString(),
  };

  try {
    writeFileSync(targetLockPath, `${JSON.stringify(lock, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    return {
      acquired: true,
      task,
      lockPath: targetLockPath,
      reclaimedStaleLock: existingLock !== null,
      lock,
    };
  } catch (error) {
    if (error?.code === "EEXIST") {
      return {
        acquired: false,
        task,
        lockPath: targetLockPath,
        existingLock: readLock(targetLockPath),
      };
    }
    throw error;
  }
}

export function releaseLock(task, ownerId, targetLockPath = lockPath) {
  assertTask(task);
  if (!ownerId?.trim()) throw new Error("Lock ownerId is required");
  const existingLock = readLock(targetLockPath);
  if (!existingLock) {
    return {
      released: false,
      task,
      lockPath: targetLockPath,
      reason: "no_lock",
    };
  }
  if (existingLock.invalid === true) {
    return {
      released: false,
      task,
      lockPath: targetLockPath,
      reason: "invalid_lock",
    };
  }
  if (existingLock.task !== task) {
    return {
      released: false,
      task,
      lockPath: targetLockPath,
      reason: "owned_by_other_task",
      existingLock,
    };
  }
  if (existingLock.ownerId !== ownerId) {
    return {
      released: false,
      task,
      lockPath: targetLockPath,
      reason: "owned_by_other_run",
      existingLock,
    };
  }

  unlinkSync(targetLockPath);
  return { released: true, task, lockPath: targetLockPath };
}

function assertLockOwnership(task, ownerId) {
  const existingLock = readLock();
  if (
    !existingLock ||
    existingLock.invalid === true ||
    existingLock.task !== task ||
    existingLock.ownerId !== ownerId
  ) {
    throw new Error("The current automation run does not own the shared lock");
  }
  return existingLock;
}

function recordSuccess(task, ownerId, summary, now = new Date()) {
  assertTask(task);
  const lock = assertLockOwnership(task, ownerId);
  if (!summary?.trim()) throw new Error("A non-empty summary is required");
  validatePublicationPackage(
    {
      seriesRegistry: JSON.parse(readFileSync(eventSeriesPath, "utf8")),
      sourceRegistry: JSON.parse(readFileSync(sourceRegistryPath, "utf8")),
      templates: JSON.parse(readFileSync(eventTemplatesPath, "utf8")),
      events: JSON.parse(readFileSync(publishedEventsPath, "utf8")),
    },
    now,
    lock.acquiredAt,
  );

  const state = readState();
  state[task] = {
    lastSuccessfulAt: toHelsinkiIso(now),
    summary: summary.trim(),
  };
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return { task, ...state[task] };
}

function assertTask(task) {
  if (!(task in AUTOMATION_INTERVAL_HOURS)) {
    throw new Error('Task must be either "routine" or "discovery"');
  }
}

function printResult(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

export function parseGateArguments(argv) {
  const [command, task, ...rest] = argv.filter((argument) => argument !== "--");
  return { command, task, rest };
}

function runCli(argv) {
  const { command, task, rest } = parseGateArguments(argv);

  if (command === "status") {
    printResult(getAutomationGate(task, readState()));
    return;
  }
  if (command === "acquire") {
    printResult(acquireLock(task));
    return;
  }
  if (command === "release") {
    printResult(releaseLock(task, rest[0]));
    return;
  }
  if (command === "record") {
    printResult(recordSuccess(task, rest[0], rest.slice(1).join(" ")));
    return;
  }

  throw new Error(
    "Usage: node scripts/automation-gate.mjs <status|acquire|release|record> <routine|discovery> [ownerId] [summary]",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  }
}
