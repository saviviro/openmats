#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { format } from "prettier";

import {
  materializeOccurrenceDates,
  occurrenceId,
  parseEventSeriesRegistry,
} from "../src/lib/event-series.ts";
import { eventSchema } from "../src/lib/event-schema.ts";
import { parseSourceRegistry } from "../src/lib/source-registry.ts";

export const PUBLICATION_HORIZON_DAYS = 56;

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const seriesPath = resolve(repositoryRoot, "data/event-series.json");
const templatesPath = resolve(repositoryRoot, "data/event-templates.json");
const sourceRegistryPath = resolve(repositoryRoot, "data/source-registry.json");
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
  sourceRegistryInput,
) {
  const registry = parseEventSeriesRegistry(registryInput);
  const sourceRegistry = parseSourceRegistry(sourceRegistryInput);
  const datedSeriesIds = new Set(
    sourceRegistry.venues.flatMap(({ datedOpenMats }) =>
      datedOpenMats.map(({ seriesId }) => seriesId),
    ),
  );
  const recurringSeriesIds = new Set(registry.series.map(({ id }) => id));
  for (const seriesId of datedSeriesIds) {
    if (recurringSeriesIds.has(seriesId)) {
      throw new Error(
        `Event series ${seriesId} cannot be both recurring and explicitly dated`,
      );
    }
  }
  const templates = validateTemplates(templateInput, [
    ...recurringSeriesIds,
    ...datedSeriesIds,
  ]);
  validateSeriesAgainstSources(registry, sourceRegistry, templates);

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
      sourceUrl: occurrenceSourceUrl(series, date),
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
  const datedEvents = materializeDatedEvents(sourceRegistry, templates);

  const events = [...recurringEvents, ...datedEvents].sort(
    (first, second) =>
      Date.parse(first.startAt) - Date.parse(second.startAt) ||
      first.id.localeCompare(second.id),
  );
  for (const event of events) eventSchema.parse(event);
  return events;
}

function materializeDatedEvents(sourceRegistry, templates) {
  const allEntriesBySeries = new Map();

  for (const venue of sourceRegistry.venues) {
    for (const openMat of venue.datedOpenMats) {
      const existing = allEntriesBySeries.get(openMat.seriesId);
      if (existing && existing.venue.id !== venue.id) {
        throw new Error(
          `Dated event series ${openMat.seriesId} is attached to multiple venues`,
        );
      }
      allEntriesBySeries.set(openMat.seriesId, {
        venue,
        entries: [...(existing?.entries ?? []), openMat],
      });
    }
  }

  return [...allEntriesBySeries.entries()].flatMap(
    ([seriesId, { venue, entries }]) => {
      const template = templates.get(seriesId);
      if (!template) throw new Error(`Missing event template for ${seriesId}`);

      const dates = entries.map(({ date }) => date).sort();
      const primarySource = selectPrimaryDatedSource(venue);
      const supportingSourceUrls = venue.sources
        .map(({ url }) => url)
        .filter((url) => url !== primarySource.url);

      return entries.flatMap((entry) => {
        if (
          entry.status !== "scheduled" ||
          !["ready_for_event_review", "needs_access_confirmation"].includes(
            entry.publishStatus,
          )
        ) {
          return [];
        }

        const formats = formatsFromDisciplines(entry.disciplines);
        if (JSON.stringify(formats) !== JSON.stringify(template.formats)) {
          throw new Error(
            `Dated event formats do not match the template for ${seriesId}`,
          );
        }

        return {
          id: occurrenceId(seriesId, entry.date),
          title: template.title,
          formats,
          startAt: localDateTime(entry.date, entry.startTime),
          endAt: localDateTime(entry.date, entry.endTime),
          venue: template.venue,
          price: template.price,
          access: template.access,
          status: template.status,
          sourceUrl: primarySource.url,
          sourceLabel: template.sourceLabel,
          verifiedAt: venue.checkedAt,
          schedule: {
            seriesId,
            validFrom: dates.at(0),
            validThrough: dates.at(-1),
            materializedThrough: dates.at(-1),
            exceptionStatus:
              entry.publishStatus === "needs_access_confirmation"
                ? "confirmation_required"
                : "none_found",
            exceptionCheckedAt: venue.checkedAt,
            exceptionNote: template.exceptionNote,
            supportingSourceUrls,
          },
          isExample: template.isExample,
        };
      });
    },
  );
}

function selectPrimaryDatedSource(venue) {
  const source = [...venue.sources].sort(
    (first, second) =>
      first.priority - second.priority ||
      sourceTypePriority(first.type) - sourceTypePriority(second.type),
  )[0];
  if (!source) {
    throw new Error(`Dated event venue ${venue.id} has no source`);
  }
  return source;
}

function sourceTypePriority(type) {
  return {
    official_event: 0,
    official_schedule: 1,
    official_visitor_policy: 2,
    official_location: 3,
    official_home: 4,
  }[type];
}

function formatsFromDisciplines(disciplines) {
  const formats = [];
  if (disciplines.includes("bjj")) formats.push("gi");
  if (
    disciplines.includes("nogi") ||
    disciplines.includes("submission_wrestling")
  ) {
    formats.push("no-gi");
  }
  return formats.length === 0 ? null : formats;
}

function occurrenceSourceUrl(series, date) {
  const sourceUrl =
    series.occurrenceSourceUrlTemplate?.replace("{date}", date) ??
    series.primarySourceUrl;
  new URL(sourceUrl);
  return sourceUrl;
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

function validateTemplates(input, expectedSeriesIds) {
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

  const expected = new Set(expectedSeriesIds);
  for (const seriesId of expected) {
    if (!templates.has(seriesId)) {
      throw new Error(`Missing event template for ${seriesId}`);
    }
  }
  for (const seriesId of templates.keys()) {
    if (!expected.has(seriesId)) {
      throw new Error(`Event template has no canonical series: ${seriesId}`);
    }
  }

  return templates;
}

function validateSeriesAgainstSources(registry, sourceRegistry, templates) {
  const venues = new Map(
    sourceRegistry.venues.map((venue) => [venue.id, venue]),
  );
  const allowedPublicationStatusesByCandidate = {
    ready_for_event_review: ["publish", "publish_with_confirmation"],
    needs_access_confirmation: ["publish_with_confirmation"],
    blocked_by_source_conflict: ["blocked_conflicting_source"],
    members_only_do_not_publish: [],
  };

  for (const series of registry.series) {
    const venue = venues.get(series.venueId);
    if (!venue) {
      throw new Error(
        `Event series ${series.id} references an unknown source venue`,
      );
    }

    const candidates = venue.candidateOpenMats.filter(
      (candidate) =>
        candidate.weekday === series.weekday &&
        candidate.startTime === series.startTime &&
        candidate.endTime === series.endTime,
    );
    if (candidates.length !== 1) {
      throw new Error(
        `Event series ${series.id} must match exactly one source candidate`,
      );
    }

    const [candidate] = candidates;
    if (
      !allowedPublicationStatusesByCandidate[candidate.publishStatus].includes(
        series.publicationStatus,
      ) ||
      candidate.validFrom !== series.validFrom ||
      candidate.validThrough !== series.validThrough
    ) {
      throw new Error(
        `Event series ${series.id} conflicts with its source candidate`,
      );
    }

    const formats = formatsFromDisciplines(candidate.disciplines);
    if (
      JSON.stringify(formats) !==
      JSON.stringify(templates.get(series.id)?.formats)
    ) {
      throw new Error(
        `Event series ${series.id} formats conflict with its source candidate`,
      );
    }
  }
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

async function serializeForFile(value) {
  return format(serialize(value), { parser: "json" });
}

async function runCli(argv) {
  const { command, from } = parseArguments(argv);
  const registry = readJson(seriesPath);
  const templates = readJson(templatesPath);
  const sourceRegistry = readJson(sourceRegistryPath);
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
      sourceRegistry,
    );
    writeFileSync(seriesPath, await serializeForFile(registry), "utf8");
    writeFileSync(
      eventsPath,
      await serializeForFile(materializedEvents),
      "utf8",
    );
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
    const expected = buildPublishedEvents(registry, templates, sourceRegistry);
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
  runCli(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  });
}
