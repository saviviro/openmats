import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const eventSchema = z
  .object({
    title: z.string().min(3),
    sport: z.enum(["bjj", "submission-wrestling"]),
    uniform: z.enum(["gi", "no-gi", "mixed"]),
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
