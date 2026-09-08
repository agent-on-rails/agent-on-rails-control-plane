/**
 * Local git state for sibling repos — used by `npm run ci`.
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function git(repoRoot, args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return { ok: false, stdout: "", stderr: (result.stderr || "").trim() };
  }
  return { ok: true, stdout: (result.stdout || "").trim(), stderr: "" };
}

function readRepoGitStatus(repoRoot) {
  if (!repoRoot || !fs.existsSync(path.join(repoRoot, ".git"))) {
    return {
      ok: false,
      error: repoRoot && fs.existsSync(repoRoot) ? "not a git repository" : "not cloned",
      headSha: null,
      headShort: "—",
      branch: null,
      uncommitted: false,
      uncommittedCount: 0,
      unpushed: 0,
    };
  }

  const head = git(repoRoot, ["rev-parse", "HEAD"]);
  const branch = git(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const porcelain = git(repoRoot, ["status", "--porcelain"]);
  const unpushed = git(repoRoot, ["rev-list", "--count", "@{u}..HEAD"]);

  const uncommittedLines = porcelain.ok
    ? porcelain.stdout.split("\n").filter((line) => line.trim().length > 0)
    : [];

  const unpushedCount =
    unpushed.ok && unpushed.stdout && /^\d+$/.test(unpushed.stdout)
      ? Number.parseInt(unpushed.stdout, 10)
      : 0;

  const headSha = head.ok ? head.stdout : null;

  return {
    ok: head.ok,
    error: head.ok ? null : head.stderr || "git rev-parse failed",
    headSha,
    headShort: headSha ? headSha.slice(0, 7) : "—",
    branch: branch.ok ? branch.stdout : null,
    uncommitted: uncommittedLines.length > 0,
    uncommittedCount: uncommittedLines.length,
    unpushed: unpushedCount,
  };
}

module.exports = {
  readRepoGitStatus,
};
