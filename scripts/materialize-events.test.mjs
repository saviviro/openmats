import { describe, expect, it } from "vitest";

import {
  PUBLICATION_HORIZON_DAYS,
  addIsoDays,
  helsinkiOffset,
} from "./materialize-events.mjs";

describe("event materialization", () => {
  it("uses an eight-week rolling publication horizon", () => {
    expect(addIsoDays("2026-07-28", PUBLICATION_HORIZON_DAYS)).toBe(
      "2026-09-22",
    );
  });

  it("uses Helsinki daylight-saving offsets for each occurrence", () => {
    expect(helsinkiOffset("2026-10-24", "12:00")).toBe("+03:00");
    expect(helsinkiOffset("2026-10-25", "12:00")).toBe("+02:00");
  });
});
