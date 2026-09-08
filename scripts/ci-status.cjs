#!/usr/bin/env node
/**
 * Live CI dashboard for Agent On Rails sibling repos.
 * Same operator pattern as suherman.net `npm run ci`: sticky TTY view of
 * local git state, GitHub Actions, and production endpoints.
 *
 * Usage:
 *   npm run ci
 *   npm run ci -- --once
 *   npm run ci -- --interval 15
 */

if (process.stdout.isTTY) {
  delete process.env.NO_COLOR;
  process.env.FORCE_COLOR = "1";
  if (!process.env.TERM || process.env.TERM === "dumb") {
    process.env.TERM = "xterm-256color";
  }
}

const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { getRepos, getProductionServices } = require("./stack-config.cjs");
const { readRepoGitStatus } = require("./git-repo-status.cjs");
const { runChecks } = require("./check-control-plane.cjs");

const REPOS = getRepos();
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap =
  (open) =>
  (t) =>
    useColor ? `${open}${t}\x1b[0m` : t;
const green = wrap("\x1b[32m");
const red = wrap("\x1b[31m");
const yellow = wrap("\x1b[33m");
const cyan = wrap("\x1b[36m");
const dim = wrap("\x1b[2m");
const bold = wrap("\x1b[1m");
const boldGreen = (t) => bold(green(t));
const boldRed = (t) => bold(red(t));
const boldYellow = (t) => bold(yellow(t));

function parseArgs(argv) {
  let once = false;
  let intervalMs = Number.parseInt(process.env.AOR_CI_INTERVAL || "10", 10) * 1000;
  let branch = process.env.AOR_CI_BRANCH || null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--once") once = true;
    else if (argv[i] === "--interval" && argv[i + 1]) {
      intervalMs = Math.max(1, Number.parseInt(argv[++i], 10) || 10) * 1000;
    } else if (argv[i] === "--branch" && argv[i + 1]) {
      branch = argv[++i];
    } else if (argv[i] === "-h" || argv[i] === "--help") {
      console.log(`Usage: npm run ci [-- --once] [--interval <sec>] [--branch <name>]

  npm run ci                 live dashboard (Ctrl+C to stop)
  npm run ci:once            snapshot and exit
  npm run check              schemas, spec/ADR IDs, Markdown links

  AOR_CI_INTERVAL=10         idle refresh interval in seconds (default 10)
  AOR_CI_BRANCH              optional GitHub Actions branch filter

Requires gh (optional): GitHub Actions columns stay empty until \`gh auth login\`.
`);
      process.exit(0);
    }
  }
  return { once, intervalMs, branch };
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasCommand(command) {
  const result = spawnSync("sh", ["-c", `command -v ${command}`], {
    encoding: "utf8",
  });
  return result.status === 0 && Boolean(result.stdout.trim());
}

function ghReady() {
  if (!hasCommand("gh")) return { ok: false, error: "gh not installed" };
  const auth = spawnSync("gh", ["auth", "status"], { encoding: "utf8" });
  if (auth.status !== 0) return { ok: false, error: "gh not authenticated" };
  return { ok: true, error: null };
}

function ghAsync(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("gh", args, { encoding: "utf8" });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error((stderr || stdout).trim() || `gh ${args.join(" ")} exited ${code}`),
        );
        return;
      }
      resolve(stdout);
    });
    child.on("error", reject);
  });
}

function hasLocalWorkflows(repoDir) {
  const workflowsDir = path.join(repoDir, ".github", "workflows");
  if (!fs.existsSync(workflowsDir)) return false;
  return fs
    .readdirSync(workflowsDir)
    .some((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
}

function formatRelativeTime(iso) {
  if (!iso) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatLastCheck(date) {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function stripAnsi(text) {
  return String(text).replace(/\x1b\[[0-9;]*m/g, "");
}

function plainTruncate(text, width) {
  const plain = stripAnsi(text);
  if (plain.length <= width) return plain;
  if (width <= 1) return "…";
  return `${plain.slice(0, width - 1)}…`;
}

function padRendered(rendered, plain, width) {
  const clipped = plainTruncate(plain, width);
  if (clipped === plain) {
    return rendered + " ".repeat(Math.max(0, width - plain.length));
  }
  return dim(clipped) + " ".repeat(Math.max(0, width - clipped.length));
}

class LiveDashboard {
  constructor() {
    this.enabled = Boolean(process.stdout.isTTY);
    this.started = false;
  }

  rows() {
    return Math.max(20, process.stdout.rows || 40);
  }

  start() {
    if (!this.enabled || this.started) return;
    process.stdout.write("\x1b[?1049h\x1b[2J\x1b[H\x1b[?25l");
    this.started = true;
  }

  stop() {
    if (!this.started) return;
    process.stdout.write("\x1b[?25h\x1b[?1049l");
    this.started = false;
  }

  render({ pinned = [], footer = "" } = {}) {
    if (!this.enabled) {
      for (const line of pinned) console.log(line);
      if (footer) console.log(footer);
      return;
    }

    const rows = this.rows();
    const footerRows = footer ? 1 : 0;
    let lines = pinned;
    const maxPinned = Math.max(8, rows - footerRows);
    if (lines.length > maxPinned) {
      const hidden = lines.length - maxPinned + 1;
      lines = [dim(`… ${hidden} earlier line(s) hidden`), ...lines.slice(-(maxPinned - 1))];
    }

    const frame = new Array(rows).fill("");
    for (let i = 0; i < lines.length && i < rows; i += 1) {
      frame[i] = lines[i];
    }
    if (footer && rows > 0) {
      frame[rows - 1] = footer;
    }

    process.stdout.write("\x1b[H");
    for (let r = 0; r < rows; r += 1) {
      process.stdout.write("\x1b[2K");
      process.stdout.write(frame[r] ?? "");
      if (r < rows - 1) process.stdout.write("\n");
    }
    process.stdout.write("\x1b[1;1H");
  }
}

function boxWidth() {
  const cols = process.stdout.columns || 100;
  return Math.max(72, Math.min(cols - 1, 120));
}

function clipBoxLine(line, inner) {
  const plain = stripAnsi(line);
  if (plain.length <= inner) {
    return { text: line, pad: " ".repeat(inner - plain.length) };
  }
  const clipped = plainTruncate(plain, inner);
  const open = String(line).match(/^(\x1b\[[0-9;]*m)+/)?.[0] || "";
  const close = String(line).includes("\x1b[0m") ? "\x1b[0m" : "";
  return { text: `${open}${clipped}${close}`, pad: "" };
}

function renderBox(title, bodyLines, colorFn = dim) {
  const width = boxWidth();
  const inner = width - 4;
  const titlePlain = stripAnsi(title);
  const titlePad = Math.max(0, width - titlePlain.length - 5);
  const lines = [
    colorFn(`┌─ `) + bold(colorFn(titlePlain)) + colorFn(` ${"─".repeat(titlePad)}┐`),
  ];
  for (const line of bodyLines) {
    const { text, pad } = clipBoxLine(line, inner);
    lines.push(`${colorFn("│")} ${text}${pad} ${colorFn("│")}`);
  }
  lines.push(colorFn(`└${"─".repeat(Math.max(1, width - 2))}┘`));
  return lines;
}

function fitColumns(inner, specs, sep = "  ") {
  const sepTotal = sep.length * Math.max(0, specs.length - 1);
  let leftover = inner - sepTotal - specs.reduce((sum, spec) => sum + spec.min, 0);
  const widths = specs.map((spec) => spec.min);
  if (leftover < 0) {
    for (let i = widths.length - 1; i >= 0 && leftover < 0; i -= 1) {
      const shrink = Math.min(Math.max(0, widths[i] - 4), -leftover);
      if (shrink > 0) {
        widths[i] -= shrink;
        leftover += shrink;
      }
    }
  } else {
    const targets = specs
      .map((spec, i) => (spec.flex ? i : -1))
      .filter((i) => i >= 0);
    const dest = targets.length ? targets : [widths.length - 1];
    const extra = Math.floor(leftover / dest.length);
    for (const i of dest) {
      widths[i] += extra;
    }
    widths[dest[dest.length - 1]] += leftover - extra * dest.length;
  }
  return widths;
}

function tableLine(cells, widths, sep = "  ") {
  return cells
    .map((cell, i) => padRendered(cell.rendered, cell.plain, widths[i]))
    .join(sep);
}

function gitLabel(git) {
  if (!git.ok) return { text: git.error || "missing", color: dim };
  const parts = [];
  if (git.uncommitted) parts.push(`dirty ${git.uncommittedCount}`);
  if (git.unpushed > 0) parts.push(`unpushed ${git.unpushed}`);
  if (parts.length === 0) return { text: "clean", color: green };
  return { text: parts.join(" + "), color: yellow };
}

function isActiveRun(run) {
  return run?.status === "in_progress" || run?.status === "queued";
}

function actionsLabel(actions) {
  if (actions.missingRepo) return { text: "not on GitHub", color: dim };
  if (actions.skipped) return { text: "no workflows", color: dim };
  if (actions.error) return { text: "gh error", color: red };
  const run = actions.run;
  if (!run) return { text: "no runs", color: dim };
  if (isActiveRun(run)) return { text: `⟳ ${run.status}`, color: boldYellow };
  if (run.conclusion === "success") return { text: "✓ success", color: boldGreen };
  if (run.conclusion === "failure") return { text: "✗ failure", color: boldRed };
  return { text: run.conclusion || run.status || "—", color: dim };
}

async function listLatestRun(slug, branch) {
  const args = [
    "run",
    "list",
    "--repo",
    slug,
    "--limit",
    "1",
    "--json",
    "databaseId,status,conclusion,name,headBranch,createdAt,updatedAt,url,displayTitle,event",
  ];
  if (branch) args.push("--branch", branch);
  const stdout = await ghAsync(args);
  const runs = JSON.parse(stdout || "[]");
  return runs[0] || null;
}

async function fetchActions(repo, { branch, gh }) {
  if (!gh.ok) {
    return { skipped: false, error: gh.error, run: null };
  }
  try {
    const run = await listLatestRun(repo.slug, branch);
    return { skipped: false, error: null, run, missingRepo: false };
  } catch (err) {
    const message = err.message || String(err);
    if (/Could not resolve to a Repository|HTTP 404/i.test(message)) {
      return { skipped: false, missingRepo: true, error: null, run: null };
    }
    if (/HTTP 404|Not Found/i.test(message) && hasLocalWorkflows(repo.dir) === false) {
      return { skipped: true, error: null, run: null };
    }
    return { skipped: false, error: message, run: null };
  }
}

function shortFetchError(err) {
  if (err.name === "AbortError") return "timeout";
  const cause = err.cause || {};
  const code = cause.code || err.code || "";
  if (code === "ERR_SSL_PACKET_LENGTH_TOO_LONG" || /ssl|tls/i.test(cause.reason || "")) {
    return "ssl error";
  }
  if (code === "ENOTFOUND") return "dns error";
  if (code === "ECONNREFUSED") return "refused";
  const message = cause.message || err.message || "fetch failed";
  return plainTruncate(message.replace(/^fetch failed$/i, "unreachable"), 18);
}

async function probeUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "agent-on-rails-ci" },
    });
    return { ok: response.ok, status: response.status, error: null };
  } catch (err) {
    return { ok: false, status: null, error: shortFetchError(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function collectSnapshot({ branch, gh }) {
  const checks = runChecks();
  const rows = await Promise.all(
    REPOS.map(async (repo) => {
      const git = readRepoGitStatus(repo.dir);
      const cloned = git.error !== "not cloned";
      if (!cloned && repo.planned) {
        return {
          repo,
          git,
          actions: { skipped: true, missingRepo: true, error: null, run: null },
        };
      }
      const actions = await fetchActions(repo, { branch, gh });
      return { repo, git, actions };
    }),
  );

  const production = await Promise.all(
    getProductionServices().map(async (service) => {
      const http = await probeUrl(service.publicUrl);
      const row = rows.find((item) => item.repo.id === service.repoId) || null;
      return { service, http, row };
    }),
  );

  return { checks, rows, production, gh };
}

function summarize(snapshot) {
  const dirty = snapshot.rows.filter(
    (row) => row.git.ok && (row.git.uncommitted || row.git.unpushed > 0),
  );
  const failed = snapshot.rows.filter(
    (row) => row.actions.run?.status === "completed" && row.actions.run?.conclusion === "failure",
  );
  const active = snapshot.rows.filter((row) => isActiveRun(row.actions.run));
  const httpBad = snapshot.production.filter((item) => !item.http.ok);
  return { dirty, failed, active, httpBad, checksOk: snapshot.checks.ok };
}

function summaryColor(summary) {
  if (summary.failed.length > 0 || !summary.checksOk || summary.httpBad.length > 0) {
    return red;
  }
  if (summary.active.length > 0 || summary.dirty.length > 0) return yellow;
  return green;
}

function summaryTitle(summary) {
  const parts = [];
  if (summary.active.length) parts.push(`${summary.active.length} in progress`);
  if (summary.failed.length) parts.push(`${summary.failed.length} failed`);
  if (summary.dirty.length) parts.push(`${summary.dirty.length} dirty`);
  if (summary.httpBad.length) parts.push(`${summary.httpBad.length} endpoint down`);
  if (!summary.checksOk) parts.push("contracts failed");
  return parts.join(" · ") || "All green";
}

function buildRepoTable(rows) {
  const inner = boxWidth() - 4;
  const sep = "  ";
  const [repoW, roleW, gitW, headW, actionsW, whenW] = fitColumns(inner, [
    { min: 16 },
    { min: 16, flex: true },
    { min: 12 },
    { min: 7 },
    { min: 13 },
    { min: 10 },
  ], sep);
  const widths = [repoW, roleW, gitW, headW, actionsW, whenW];

  const header = tableLine(
    [
      { rendered: bold("Repo"), plain: "Repo" },
      { rendered: bold("Role"), plain: "Role" },
      { rendered: bold("Git"), plain: "Git" },
      { rendered: bold("HEAD"), plain: "HEAD" },
      { rendered: bold("Actions"), plain: "Actions" },
      { rendered: bold("When"), plain: "When" },
    ],
    widths,
    sep,
  );
  const divider = [
    dim("-".repeat(repoW)),
    dim("-".repeat(roleW)),
    dim("-".repeat(gitW)),
    dim("-".repeat(headW)),
    dim("-".repeat(actionsW)),
    dim("-".repeat(whenW)),
  ].join(sep);

  const body = rows.map(({ repo, git, actions }) => {
    const gitState = gitLabel(git);
    const act = actionsLabel(actions);
    const when = actions.run
      ? formatRelativeTime(actions.run.updatedAt || actions.run.createdAt)
      : "—";
    return tableLine(
      [
        { rendered: cyan(repo.id), plain: repo.id },
        { rendered: dim(repo.role), plain: repo.role },
        { rendered: gitState.color(gitState.text), plain: gitState.text },
        { rendered: dim(git.headShort), plain: git.headShort },
        { rendered: act.color(act.text), plain: act.text },
        { rendered: dim(when), plain: when },
      ],
      widths,
      sep,
    );
  });

  return [
    dim("* dirty = uncommitted · unpushed = commits ahead of upstream"),
    "",
    header,
    divider,
    ...body,
  ];
}

function buildProductionTable(production) {
  const inner = boxWidth() - 4;
  const sep = "  ";
  const [serviceW, urlW, httpW, actionsW] = fitColumns(inner, [
    { min: 14 },
    { min: 24, flex: true },
    { min: 10 },
    { min: 12 },
  ], sep);
  const widths = [serviceW, urlW, httpW, actionsW];

  const header = tableLine(
    [
      { rendered: bold("Service"), plain: "Service" },
      { rendered: bold("Public"), plain: "Public" },
      { rendered: bold("HTTP"), plain: "HTTP" },
      { rendered: bold("Actions"), plain: "Actions" },
    ],
    widths,
    sep,
  );
  const divider = [
    dim("-".repeat(serviceW)),
    dim("-".repeat(urlW)),
    dim("-".repeat(httpW)),
    dim("-".repeat(actionsW)),
  ].join(sep);

  const body = production.map(({ service, http, row }) => {
    const httpPlain = http.ok ? String(http.status) : http.error || String(http.status || "down");
    const httpRendered = http.ok ? green(httpPlain) : red(httpPlain);
    const act = row ? actionsLabel(row.actions) : { text: "—", color: dim };
    return tableLine(
      [
        { rendered: service.label, plain: service.label },
        { rendered: cyan(service.publicUrl), plain: service.publicUrl },
        { rendered: httpRendered, plain: httpPlain },
        { rendered: act.color(act.text), plain: act.text },
      ],
      widths,
      sep,
    );
  });

  return ["", header, divider, ...body];
}

function buildChecksLines(checks) {
  return checks.sections.map((section) => {
    const bad = section.findings.filter((finding) => !finding.ok);
    if (bad.length === 0) {
      return green(`✓ ${section.title}`);
    }
    return red(`✗ ${section.title}: ${bad[0].message}`);
  });
}

function buildDashboardLines(snapshot, { lastCheckAt }) {
  const summary = summarize(snapshot);
  const colorFn = summaryColor(summary);
  const lines = [];

  lines.push(bold("Agent On Rails — npm run ci"));
  lines.push(
    dim(
      `Last check ${formatLastCheck(lastCheckAt)}${snapshot.gh.ok ? "" : ` · ${snapshot.gh.error}`}`,
    ),
  );
  lines.push("");
  lines.push(...renderBox(summaryTitle(summary), buildRepoTable(snapshot.rows), colorFn));
  lines.push("");
  lines.push(
    ...renderBox(
      "Production",
      buildProductionTable(snapshot.production),
      summary.httpBad.length ? red : green,
    ),
  );
  lines.push("");
  lines.push(
    ...renderBox(
      "Control-plane contracts",
      buildChecksLines(snapshot.checks),
      snapshot.checks.ok ? green : red,
    ),
  );

  const failedRuns = summary.failed
    .map((row) => row.actions.run?.url)
    .filter(Boolean);
  if (failedRuns.length > 0) {
    lines.push("");
    lines.push(dim("Failed runs:"));
    for (const url of failedRuns) {
      lines.push(cyan(`  ${url}`));
    }
  }
  return lines;
}

function waitFooter({ remaining, lastCheckAt, summary }) {
  const extra = summary.failed.length
    ? ` · ${summary.failed.length} failed`
    : summary.dirty.length
      ? ` · ${summary.dirty.length} dirty`
      : "";
  return dim(
    `Watching${extra} · recheck in ${remaining}s · last check ${formatLastCheck(lastCheckAt)} · Ctrl+C to stop`,
  );
}

function printLinear(snapshot) {
  for (const line of buildDashboardLines(snapshot, { lastCheckAt: new Date() })) {
    console.log(line);
  }
}

function exitCode(snapshot) {
  const summary = summarize(snapshot);
  if (!summary.checksOk || summary.failed.length > 0 || summary.httpBad.length > 0) {
    return 1;
  }
  return 0;
}

async function main() {
  const { once, intervalMs, branch } = parseArgs(process.argv.slice(2));
  const dashboard = new LiveDashboard();
  const gh = ghReady();

  process.on("SIGINT", () => {
    dashboard.stop();
    console.log(dim("\nStopped watching.\n"));
    process.exit(0);
  });

  if (process.stdout.isTTY && !once) {
    dashboard.start();
    dashboard.render({
      pinned: [dim("Initializing Agent On Rails CI dashboard…")],
    });
  }

  while (true) {
    const lastCheckAt = new Date();
    const snapshot = await collectSnapshot({ branch, gh });
    const summary = summarize(snapshot);
    const pinned = buildDashboardLines(snapshot, { lastCheckAt });

    if (once || !process.stdout.isTTY) {
      dashboard.stop();
      printLinear(snapshot);
      process.exit(exitCode(snapshot));
    }

    const seconds = Math.max(1, Math.round(intervalMs / 1000));
    for (let remaining = seconds; remaining > 0; remaining -= 1) {
      dashboard.render({
        pinned,
        footer: waitFooter({ remaining, lastCheckAt, summary }),
      });
      await sleep(1000);
    }
  }
}

main().catch((err) => {
  console.error(red(`ci-status: ${err.message || err}`));
  process.exit(1);
});
