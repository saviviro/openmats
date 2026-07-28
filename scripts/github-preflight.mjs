#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const PREFLIGHT_EXIT_CODES = Object.freeze({
  ok: 0,
  missingCredential: 2,
  executionUnavailable: 3,
  authenticationFailed: 4,
  gitUnavailable: 5,
});

export function classifyApiFailure(stderr) {
  const message = stderr.toLowerCase();
  if (
    message.includes("http 401") ||
    message.includes("bad credentials") ||
    message.includes("authentication failed")
  ) {
    return "authentication_failed";
  }
  return "network_unavailable";
}

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function printResult(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function hasConfiguredGitHubHost() {
  const configDirectory =
    process.env.GH_CONFIG_DIR ?? resolve(homedir(), ".config", "gh");
  try {
    return /^github\.com:/mu.test(
      readFileSync(resolve(configDirectory, "hosts.yml"), "utf8"),
    );
  } catch {
    return false;
  }
}

function main() {
  const storedCredential = run("gh", ["auth", "token", "-h", "github.com"]);
  if (storedCredential.status !== 0) {
    if (hasConfiguredGitHubHost()) {
      printResult({
        status: "credential_unavailable",
        message:
          "GitHub is configured, but this execution environment could not read the system-keyring credential. Retry with direct keyring and network permission.",
      });
      return PREFLIGHT_EXIT_CODES.executionUnavailable;
    }
    printResult({
      status: "missing_credential",
      message: "GitHub CLI did not find a credential in the system keyring.",
    });
    return PREFLIGHT_EXIT_CODES.missingCredential;
  }

  const api = run("gh", ["api", "user", "--jq", ".login"]);
  if (api.status !== 0) {
    const status = classifyApiFailure(api.stderr);
    printResult({
      status,
      message:
        status === "authentication_failed"
          ? "GitHub rejected the stored credential."
          : "The GitHub API could not be reached from this execution environment.",
    });
    return status === "authentication_failed"
      ? PREFLIGHT_EXIT_CODES.authenticationFailed
      : PREFLIGHT_EXIT_CODES.executionUnavailable;
  }

  const git = run("git", [
    "ls-remote",
    "--exit-code",
    "origin",
    "refs/heads/main",
  ]);
  if (git.status !== 0) {
    const status = classifyApiFailure(git.stderr);
    printResult({
      status: status === "authentication_failed" ? status : "git_unavailable",
      message:
        status === "authentication_failed"
          ? "GitHub rejected Git credentials."
          : "The Git remote could not be reached even though the API login succeeded.",
    });
    return status === "authentication_failed"
      ? PREFLIGHT_EXIT_CODES.authenticationFailed
      : PREFLIGHT_EXIT_CODES.gitUnavailable;
  }

  printResult({
    status: "ok",
    login: api.stdout.trim(),
    message: "GitHub API and origin/main are reachable.",
  });
  return PREFLIGHT_EXIT_CODES.ok;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
