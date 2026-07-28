import { describe, expect, it } from "vitest";

import { classifyApiFailure } from "./github-preflight.mjs";

describe("GitHub automation preflight", () => {
  it("recognizes a real rejected credential", () => {
    expect(classifyApiFailure("HTTP 401: Bad credentials")).toBe(
      "authentication_failed",
    );
  });

  it("does not mislabel a blocked network as an expired token", () => {
    expect(
      classifyApiFailure(
        "error connecting to api.github.com\ncheck your internet connection",
      ),
    ).toBe("network_unavailable");
  });
});
