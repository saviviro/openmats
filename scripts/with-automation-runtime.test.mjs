import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const wrapper = resolve("scripts/with-automation-runtime.sh");
const temporaryDirectories = [];

function makeRuntime() {
  const root = mkdtempSync(resolve(tmpdir(), "openmats-runtime-"));
  temporaryDirectories.push(root);
  mkdirSync(resolve(root, "node/bin"), { recursive: true });
  mkdirSync(resolve(root, "bin/fallback"), { recursive: true });
  mkdirSync(resolve(root, "bin/override"), { recursive: true });
  symlinkSync(process.execPath, resolve(root, "node/bin/node"));
  return root;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("scheduled automation runtime wrapper", () => {
  it("finds the bundled Node executable even when the incoming PATH does not", () => {
    const runtime = makeRuntime();
    const result = spawnSync(
      "/bin/sh",
      [
        wrapper,
        "node",
        "-e",
        "process.stdout.write(process.env.PATH.split(':')[0])",
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          CODEX_RUNTIME_DEPENDENCIES: runtime,
          PATH: "/usr/bin:/bin",
        },
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(resolve(runtime, "node/bin"));
  });

  it("runs a bundled pnpm command through the bundled Node path", () => {
    const runtime = makeRuntime();
    const pnpm = resolve(runtime, "bin/fallback/pnpm");
    writeFileSync(
      pnpm,
      `#!/bin/sh
node -e 'process.stdout.write(process.env.PATH.split(":")[0] + "|" + process.argv.slice(1).join("|"))' "$@"
`,
    );
    chmodSync(pnpm, 0o755);

    const result = spawnSync(
      "/bin/sh",
      [wrapper, "pnpm", "events:check", "two words"],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          CODEX_RUNTIME_DEPENDENCIES: runtime,
          PATH: "/usr/bin:/bin",
        },
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(
      `${resolve(runtime, "node/bin")}|events:check|two words`,
    );
  });

  it("preserves a child command's failure exit code", () => {
    const runtime = makeRuntime();
    const probe = resolve(runtime, "bin/fallback/failure-probe");
    writeFileSync(probe, "#!/bin/sh\nexit 23\n");
    chmodSync(probe, 0o755);

    const result = spawnSync("/bin/sh", [wrapper, "failure-probe"], {
      env: {
        ...process.env,
        CODEX_RUNTIME_DEPENDENCIES: runtime,
        PATH: "/usr/bin:/bin",
      },
    });

    expect(result.status).toBe(23);
  });

  it("fails clearly when the requested command is missing", () => {
    const runtime = makeRuntime();
    const result = spawnSync(
      "/bin/sh",
      [wrapper, "definitely-not-an-openmats-command"],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          CODEX_RUNTIME_DEPENDENCIES: runtime,
          PATH: "/usr/bin:/bin",
        },
      },
    );

    expect(result.status).toBe(127);
    expect(result.stderr).toContain(
      "command not found: definitely-not-an-openmats-command",
    );
  });

  it("rejects a Node runtime older than the project minimum", () => {
    const runtime = makeRuntime();
    const node = resolve(runtime, "node/bin/node");
    rmSync(node);
    writeFileSync(node, "#!/bin/sh\nexit 1\n");
    chmodSync(node, 0o755);

    const result = spawnSync("/bin/sh", [wrapper, "true"], {
      encoding: "utf8",
      env: {
        ...process.env,
        CODEX_RUNTIME_DEPENDENCIES: runtime,
        PATH: "/usr/bin:/bin",
      },
    });

    expect(result.status).toBe(126);
    expect(result.stderr).toContain("Node.js 22.12 or newer is required");
  });

  it("fails clearly when no command was supplied", () => {
    const result = spawnSync("/bin/sh", [wrapper], {
      encoding: "utf8",
    });

    expect(result.status).toBe(64);
    expect(result.stderr).toContain("Usage:");
  });
});
