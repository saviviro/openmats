#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");

export function expectedProductionState(
  seriesRegistry,
  events,
  automationState,
) {
  const reviewedAt = [
    automationState.routine.lastSuccessfulAt,
    automationState.discovery.lastSuccessfulAt,
  ].sort((first, second) => Date.parse(second) - Date.parse(first))[0];
  const recurringSeriesIds = new Set(seriesRegistry.series.map(({ id }) => id));
  const rollingEvents = events
    .filter(
      ({ schedule, startAt }) =>
        recurringSeriesIds.has(schedule.seriesId) &&
        startAt.slice(0, 10) <= seriesRegistry.window.through,
    )
    .sort(
      (first, second) => Date.parse(first.startAt) - Date.parse(second.startAt),
    );
  const sentinelEventId = rollingEvents.at(-1)?.id;

  if (!reviewedAt || !sentinelEventId) {
    throw new Error(
      "Could not determine the expected production review and rolling event",
    );
  }
  return { reviewedAt, sentinelEventId };
}

export function inspectProductionHtml(
  html,
  { reviewedAt, sentinelEventId, commit = null },
) {
  const checks = {
    reviewedAt: html.includes(`data-last-reviewed-at="${reviewedAt}"`),
    sentinelEvent: html.includes(`data-event-id="${sentinelEventId}"`),
    commit:
      commit === null ||
      html.includes(`<meta name="build-commit" content="${commit}"`),
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

export function parseArguments(argv) {
  const options = {
    url: "https://openmats.fi/",
    commit: process.env.EXPECTED_COMMIT ?? null,
    attempts: 12,
    delayMs: 15_000,
  };

  const normalizedArguments = argv.filter((argument) => argument !== "--");
  for (let index = 0; index < normalizedArguments.length; index += 2) {
    const name = normalizedArguments[index];
    const value = normalizedArguments[index + 1];
    if (!value) throw new Error(`Missing value for ${name}`);
    if (name === "--url") options.url = value;
    else if (name === "--commit") options.commit = value;
    else if (name === "--attempts") options.attempts = Number(value);
    else if (name === "--delay-ms") options.delayMs = Number(value);
    else throw new Error(`Unknown argument: ${name}`);
  }

  if (
    !Number.isInteger(options.attempts) ||
    options.attempts < 1 ||
    !Number.isInteger(options.delayMs) ||
    options.delayMs < 0
  ) {
    throw new Error("Attempts and delay must be non-negative integers");
  }
  return options;
}

function readJson(relativePath) {
  return JSON.parse(
    readFileSync(resolve(repositoryRoot, relativePath), "utf8"),
  );
}

async function verifyProduction(options) {
  const expected = {
    ...expectedProductionState(
      readJson("data/event-series.json"),
      readJson("src/data/events.json"),
      readJson("data/automation-state.json"),
    ),
    commit: options.commit,
  };
  let lastResult = null;
  let lastError = null;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      const response = await fetch(options.url, {
        headers: { "cache-control": "no-cache" },
      });
      if (!response.ok) {
        throw new Error(`Production returned HTTP ${response.status}`);
      }
      lastResult = inspectProductionHtml(await response.text(), expected);
      if (lastResult.ok) {
        return { verified: true, attempt, url: options.url, ...expected };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < options.attempts) {
      await new Promise((resolvePromise) =>
        setTimeout(resolvePromise, options.delayMs),
      );
    }
  }

  throw new Error(
    `Production did not match the reviewed data: ${JSON.stringify({
      expected,
      checks: lastResult?.checks ?? null,
      error: lastError,
    })}`,
  );
}

async function runCli(argv) {
  const result = await verifyProduction(parseArguments(argv));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  });
}
