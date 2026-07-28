#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  materializeOccurrenceDates,
  occurrenceId,
  parseEventSeriesRegistry,
} from "../src/lib/event-series.ts";

export const PUBLICATION_HORIZON_DAYS = 56;

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const seriesPath = resolve(repositoryRoot, "data/event-series.json");
const templatesPath = resolve(repositoryRoot, "data/event-templates.json");
const eventsPath = resolve(repositoryRoot, "src/data/events.json");

export function helsinkiDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function helsinkiOffset(isoDate, localTime) {
  let offset = offsetAt(new Date(`${isoDate}T${localTime}:00.000Z`));
  offset = offsetAt(new Date(`${isoDate}T${localTime}:00${offset}`));
  return offset;
}

export function buildPublishedEvents(
  registryInput,
  templateInput,
  eventsInput,
) {
  const registry = parseEventSeriesRegistry(registryInput);
  const templates = validateTemplates(templateInput, registry);
  const recurringSeriesIds = new Set(registry.series.map(({ id }) => id));
  const datedEvents = eventsInput.filter(
    ({ schedule }) => !recurringSeriesIds.has(schedule.seriesId),
  );
  const recurringEvents = registry.series.flatMap((series) => {
    const template = templates.get(series.id);
    if (series.publicationStatus === "blocked_conflicting_source") return [];
    if (!template) throw new Error(`Missing event template for ${series.id}`);

    return materializeOccurrenceDates(series, registry.window).map((date) => ({
      id: occurrenceId(series.id, date),
      title: template.title,
      formats: template.formats,
      startAt: localDateTime(date, series.startTime),
      endAt: localDateTime(date, series.endTime),
      venue: template.venue,
      price: template.price,
      access: template.access,
      status: template.status,
      sourceUrl: series.primarySourceUrl,
      sourceLabel: template.sourceLabel,
      verifiedAt: series.exceptionCheck.checkedAt,
      schedule: {
        seriesId: series.id,
        validFrom: series.validFrom,
        validThrough: series.validThrough,
        materializedThrough: registry.window.through,
        exceptionStatus:
          series.publicationStatus === "publish_with_confirmation"
            ? "confirmation_required"
            : "none_found",
        exceptionCheckedAt: series.exceptionCheck.checkedAt,
        exceptionNote: template.exceptionNote,
        supportingSourceUrls: series.supportingSourceUrls,
      },
      isExample: template.isExample,
    }));
  });

  return [...recurringEvents, ...datedEvents].sort(
    (first, second) =>
      Date.parse(first.startAt) - Date.parse(second.startAt) ||
      first.id.localeCompare(second.id),
  );
}

function localDateTime(isoDate, localTime) {
  return `${isoDate}T${localTime}:00${helsinkiOffset(isoDate, localTime)}`;
}

function offsetAt(date) {
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Helsinki",
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find(({ type }) => type === "timeZoneName")?.value;

  if (!timeZoneName?.startsWith("GMT")) {
    throw new Error("Could not determine Europe/Helsinki UTC offset");
  }

  return timeZoneName === "GMT" ? "+00:00" : timeZoneName.slice(3);
}

function validateTemplates(input, registry) {
  if (!input || input.version !== 1 || !Array.isArray(input.templates)) {
    throw new Error("Event templates must have version 1");
  }

  const templates = new Map();
  for (const template of input.templates) {
    if (!template?.seriesId || templates.has(template.seriesId)) {
      throw new Error("Event template series identifiers must be unique");
    }
    templates.set(template.seriesId, template);
  }

  for (const series of registry.series) {
    if (
      series.publicationStatus !== "blocked_conflicting_source" &&
      !templates.has(series.id)
    ) {
      throw new Error(`Missing event template for ${series.id}`);
    }
  }

  return templates;
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  let from = null;

  for (let index = 0; index < rest.length; index += 1) {
    if (rest[index] === "--") continue;
    if (rest[index] === "--from") {
      from = rest[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${rest[index]}`);
  }

  if (from !== null && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    throw new Error("--from must be an ISO date");
  }

  return { command, from };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function runCli(argv) {
  const { command, from } = parseArguments(argv);
  const registry = readJson(seriesPath);
  const templates = readJson(templatesPath);
  const events = readJson(eventsPath);

  if (command === "refresh") {
    const windowFrom = from ?? helsinkiDate();
    registry.window = {
      from: windowFrom,
      through: addIsoDays(windowFrom, PUBLICATION_HORIZON_DAYS),
      timezone: "Europe/Helsinki",
    };
    const materializedEvents = buildPublishedEvents(
      registry,
      templates,
      events,
    );
    writeFileSync(seriesPath, serialize(registry), "utf8");
    writeFileSync(eventsPath, serialize(materializedEvents), "utf8");
    process.stdout.write(
      `${JSON.stringify(
        {
          from: registry.window.from,
          through: registry.window.through,
          recurringEvents: materializedEvents.filter(({ schedule }) =>
            registry.series.some(({ id }) => id === schedule.seriesId),
          ).length,
          totalEvents: materializedEvents.length,
        },
        null,
        2,
      )}\n`,
    );
    return;
  }

  if (command === "check") {
    const expected = buildPublishedEvents(registry, templates, events);
    if (serialize(expected) !== serialize(events)) {
      throw new Error(
        "src/data/events.json is stale; run pnpm events:refresh after reviewing sources",
      );
    }
    process.stdout.write(
      `${JSON.stringify({ valid: true, events: events.length })}\n`,
    );
    return;
  }

  throw new Error(
    "Usage: node scripts/materialize-events.mjs <refresh|check> [--from YYYY-MM-DD]",
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
