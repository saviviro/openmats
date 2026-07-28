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

  it("does not mislabel VPN or proxy authentication as a GitHub token failure", () => {
    expect(
      classifyApiFailure(
        "proxyconnect tcp: proxy authentication failed while dialing github.com",
      ),
    ).toBe("network_unavailable");
  });

  it("keeps GitHub authorization and rate-limit failures separate from reauthentication", () => {
    expect(classifyApiFailure("HTTP 403: rate limit exceeded")).toBe(
      "authorization_unavailable",
    );
    expect(classifyApiFailure("Resource protected by organization SSO")).toBe(
      "authorization_unavailable",
    );
  });
});
