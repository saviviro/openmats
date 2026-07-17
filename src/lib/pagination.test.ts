import { describe, expect, it } from "vitest";

import { EVENTS_PER_PAGE, getPaginationState } from "./pagination";

describe("event-list pagination", () => {
  it("shows twenty events on the first page by default", () => {
    expect(getPaginationState(22, 1)).toEqual({
      page: 1,
      totalPages: 2,
      startIndex: 0,
      endIndex: EVENTS_PER_PAGE,
      firstItem: 1,
      lastItem: EVENTS_PER_PAGE,
    });
  });

  it("shows all remaining events on the last page", () => {
    expect(getPaginationState(22, 2)).toMatchObject({
      page: 2,
      totalPages: 2,
      startIndex: 20,
      endIndex: 22,
      firstItem: 21,
      lastItem: 22,
    });
  });

  it("clamps a stale page after filtering reduces the result count", () => {
    expect(getPaginationState(4, 2)).toMatchObject({
      page: 1,
      totalPages: 1,
      firstItem: 1,
      lastItem: 4,
    });
  });

  it("returns an empty state without an artificial page", () => {
    expect(getPaginationState(0, 1)).toEqual({
      page: 0,
      totalPages: 0,
      startIndex: 0,
      endIndex: 0,
      firstItem: 0,
      lastItem: 0,
    });
  });
});
