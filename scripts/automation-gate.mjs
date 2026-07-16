#!/usr/bin/env node

import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const AUTOMATION_INTERVAL_HOURS = Object.freeze({
  routine: 168,
  discovery: 28 * 24,
});

export const LOCK_MAX_AGE_HOURS = 8;

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const statePath = resolve(repositoryRoot, "data/automation-state.json");
const lockPath = resolve(repositoryRoot, ".automation-run.lock");

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

function readState() {
  return validateAutomationState(JSON.parse(readFileSync(statePath, "utf8")));
}

function readLock() {
  try {
    return JSON.parse(readFileSync(lockPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function acquireLock(task, now = new Date()) {
  assertTask(task);
  const existingLock = readLock();

  if (existingLock) {
    const age = now.getTime() - Date.parse(existingLock.acquiredAt);
    return {
      acquired: false,
      task,
      stale: Number.isFinite(age) && age > LOCK_MAX_AGE_HOURS * 3_600_000,
      existingLock,
    };
  }

  const lock = {
    version: 1,
    task,
    acquiredAt: now.toISOString(),
  };

  try {
    writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    return { acquired: true, task, lock };
  } catch (error) {
    if (error?.code === "EEXIST") {
      return { acquired: false, task, existingLock: readLock() };
    }
    throw error;
  }
}

function releaseLock(task) {
  assertTask(task);
  const existingLock = readLock();
  if (!existingLock) return { released: false, task, reason: "no_lock" };
  if (existingLock.task !== task) {
    return {
      released: false,
      task,
      reason: "owned_by_other_task",
      existingLock,
    };
  }

  unlinkSync(lockPath);
  return { released: true, task };
}

function recordSuccess(task, summary, now = new Date()) {
  assertTask(task);
  if (!summary?.trim()) throw new Error("A non-empty summary is required");

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

function runCli(argv) {
  const [command, task, ...rest] = argv;

  if (command === "status") {
    printResult(getAutomationGate(task, readState()));
    return;
  }
  if (command === "acquire") {
    printResult(acquireLock(task));
    return;
  }
  if (command === "release") {
    printResult(releaseLock(task));
    return;
  }
  if (command === "record") {
    printResult(recordSuccess(task, rest.join(" ")));
    return;
  }

  throw new Error(
    "Usage: node scripts/automation-gate.mjs <status|acquire|release|record> <routine|discovery> [summary]",
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
