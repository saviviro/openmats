import { z } from "astro/zod";

export const REGION_CITIES = [
  "Helsinki",
  "Espoo",
  "Vantaa",
  "Kauniainen",
] as const;

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const registrySourceSchema = z.object({
  type: z.enum([
    "official_home",
    "official_location",
    "official_schedule",
    "official_visitor_policy",
    "official_event",
  ]),
  label: z.string().min(3),
  url: z.url(),
  format: z.enum(["html", "pdf", "dynamic"]),
  priority: z.number().int().min(1).max(3),
});

export const openMatCandidateSchema = z
  .object({
    weekday: z.number().int().min(1).max(7),
    startTime: localTimeSchema,
    endTime: localTimeSchema,
    disciplines: z.array(z.enum(["bjj", "nogi", "submission_wrestling"])),
    publishStatus: z.enum([
      "ready_for_event_review",
      "needs_access_confirmation",
      "members_only_do_not_publish",
      "blocked_by_source_conflict",
    ]),
    validFrom: isoDateSchema.nullable(),
    validThrough: isoDateSchema.nullable(),
    notes: z.string().min(3),
  })
  .refine(({ startTime, endTime }) => endTime > startTime, {
    message: "Candidate endTime must be later than startTime",
    path: ["endTime"],
  })
  .refine(
    ({ validFrom, validThrough }) =>
      validFrom === null || validThrough === null || validThrough >= validFrom,
    {
      message: "Candidate validThrough must not precede validFrom",
      path: ["validThrough"],
    },
  );

export const datedOpenMatSchema = z
  .object({
    date: isoDateSchema,
    startTime: localTimeSchema,
    endTime: localTimeSchema,
    disciplines: z.array(z.enum(["bjj", "nogi", "submission_wrestling"])),
    status: z.enum(["scheduled", "cancelled"]),
    publishStatus: z.enum([
      "ready_for_event_review",
      "needs_access_confirmation",
      "blocked_by_source_conflict",
      "cancelled_do_not_publish",
    ]),
    notes: z.string().min(3),
  })
  .refine(({ startTime, endTime }) => endTime > startTime, {
    message: "Dated open mat endTime must be later than startTime",
    path: ["endTime"],
  })
  .refine(
    ({ status, publishStatus }) =>
      status !== "cancelled" || publishStatus === "cancelled_do_not_publish",
    {
      message: "A cancelled open mat must not be eligible for publication",
      path: ["publishStatus"],
    },
  );

export const venueSourceRecordSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    organization: z.string().min(2),
    venueName: z.string().min(2),
    status: z.enum(["active", "planned"]),
    city: z.enum(REGION_CITIES),
    address: z.string().min(5).nullable(),
    disciplines: z
      .array(z.enum(["bjj", "nogi", "submission_wrestling"]))
      .min(1),
    openMatAccess: z.enum([
      "public_confirmed",
      "public_with_conditions",
      "members_only_confirmed",
      "mixed",
      "unconfirmed",
      "no_open_mat_found",
    ]),
    collectionReadiness: z.enum([
      "ready",
      "manual_review",
      "discovery_only",
      "planned",
    ]),
    evidenceSummary: z.string().min(10),
    sources: z.array(registrySourceSchema).min(1),
    candidateOpenMats: z.array(openMatCandidateSchema).default([]),
    datedOpenMats: z.array(datedOpenMatSchema).default([]),
    checkedAt: z.iso.datetime({ offset: true }),
    monitoringNotes: z.string().min(3).nullable(),
  })
  .refine(
    ({ openMatAccess, candidateOpenMats, datedOpenMats }) =>
      openMatAccess !== "no_open_mat_found" ||
      (candidateOpenMats.length === 0 && datedOpenMats.length === 0),
    {
      message:
        "A venue with no open mat found must not retain event candidates",
      path: ["openMatAccess"],
    },
  )
  .refine(
    ({ collectionReadiness, candidateOpenMats, datedOpenMats }) =>
      collectionReadiness !== "discovery_only" ||
      (candidateOpenMats.length === 0 && datedOpenMats.length === 0),
    {
      message: "A discovery-only venue must not retain event candidates",
      path: ["collectionReadiness"],
    },
  )
  .refine(
    ({ collectionReadiness, candidateOpenMats }) =>
      !candidateOpenMats.some(
        ({ publishStatus }) => publishStatus === "blocked_by_source_conflict",
      ) || collectionReadiness === "manual_review",
    {
      message: "A source conflict requires manual review",
      path: ["collectionReadiness"],
    },
  );

export const sourceRegistrySchema = z.object({
  version: z.literal(1),
  timezone: z.literal("Europe/Helsinki"),
  checkedAt: z.iso.datetime({ offset: true }),
  discoveryReviewedAt: z.iso.datetime({ offset: true }),
  discoveryReviewNotes: z.string().min(10),
  scopeCities: z.tuple([
    z.literal("Helsinki"),
    z.literal("Espoo"),
    z.literal("Vantaa"),
    z.literal("Kauniainen"),
  ]),
  coverage: z.array(
    z.object({
      city: z.enum(REGION_CITIES),
      status: z.enum(["mapped", "searched_no_active_venue_found"]),
      activeVenueCount: z.number().int().nonnegative(),
      plannedVenueCount: z.number().int().nonnegative(),
      notes: z.string().min(10),
    }),
  ),
  venues: z.array(venueSourceRecordSchema),
});

export type SourceRegistry = z.infer<typeof sourceRegistrySchema>;
export type VenueSourceRecord = z.infer<typeof venueSourceRecordSchema>;

export function parseSourceRegistry(input: unknown): SourceRegistry {
  return sourceRegistrySchema.parse(input);
}
