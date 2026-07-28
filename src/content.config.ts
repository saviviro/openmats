import { defineCollection } from "astro:content";
import { file } from "astro/loaders";

import { eventSchema } from "./lib/event-schema";

const events = defineCollection({
  loader: file("src/data/events.json"),
  schema: eventSchema,
});

export const collections = { events };
