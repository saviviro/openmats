import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const eventSchema = z
  .object({
    title: z.string().min(3),
    formats: z
      .array(z.enum(["gi", "no-gi"]))
      .min(1)
      .max(2)
      .nullable()
      .refine(
        (formats) =>
          formats === null || new Set(formats).size === formats.length,
        "Event formats must be unique",
      ),
    startAt: z.iso.datetime({ offset: true }),
    endAt: z.iso.datetime({ offset: true }),
    venue: z.object({
      name: z.string().min(2),
      streetAddress: z.string().min(3),
      postalCode: z.string().regex(/^\d{5}$/),
      city: z.enum(["Helsinki", "Espoo", "Vantaa", "Kauniainen"]),
    }),
    price: z.object({
      amount: z.number().nonnegative().nullable(),
      currency: z.literal("EUR"),
      note: z.string().min(1),
    }),
    access: z.object({
      description: z.string().min(3),
      registrationRequired: z.boolean(),
    }),
    status: z.enum(["scheduled", "cancelled", "rescheduled", "uncertain"]),
    sourceUrl: z.url(),
    sourceLabel: z.string().min(2),
    verifiedAt: z.iso.datetime({ offset: true }),
    schedule: z.object({
      seriesId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      validFrom: z.iso.date().nullable(),
      validThrough: z.iso.date().nullable(),
      materializedThrough: z.iso.date(),
      exceptionStatus: z.enum(["none_found", "confirmation_required"]),
      exceptionCheckedAt: z.iso.datetime({ offset: true }),
      exceptionNote: z.string().min(10),
      supportingSourceUrls: z.array(z.url()),
    }),
    isExample: z.boolean(),
  })
  .refine((event) => Date.parse(event.endAt) > Date.parse(event.startAt), {
    message: "Event endAt must be later than startAt",
    path: ["endAt"],
  });

const events = defineCollection({
  loader: file("src/data/events.json"),
  schema: eventSchema,
});

export const collections = { events };
