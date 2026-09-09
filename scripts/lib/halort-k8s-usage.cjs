/**
 * Compact HaloRT Hetzner K3s health for the Agent On Rails `npm run ci` dashboard.
 *
 * Reuses `halort-infra/scripts/cluster-health.cjs` (same probe as HaloRT `npm run ci`).
 */
const fs = require("node:fs");
const path = require("node:path");
const { HALORT_INFRA_ROOT } = require("../stack-config.cjs");

const DEFAULT_CACHE_MS =
  Number.parseInt(process.env.AOR_CI_K8S_CACHE_SEC || "30", 10) * 1000;

/** @type {{ fetchedAt: number, summary: object } | null} */
let cache = null;
/** @type {Promise<object> | null} */
let inflight = null;

function clusterHealthModulePath(infraRoot) {
  return path.join(infraRoot, "scripts", "cluster-health.cjs");
}

function formatGiB(bytes) {
  if (!bytes || bytes <= 0) return "—";
  return `${(bytes / 1024 ** 3).toFixed(1)} GiB`;
}

function formatCpuUsage(milli) {
  if (milli === null || milli === undefined) return null;
  if (milli >= 1000) {
    const cores = milli / 1000;
    return Number.isInteger(cores) ? `${cores} cores` : `${cores.toFixed(2)} cores`;
  }
  return `${Math.round(milli)}m`;
}

function emptySummary(overrides = {}) {
  return {
    ok: false,
    skipped: false,
    fetching: false,
    reachable: false,
    error: null,
    health: null,
    nodeCount: null,
    nodesReady: null,
    access: null,
    avgCpuPercent: null,
    avgMemoryPercent: null,
    maxDiskPercent: null,
    clusterLoad1: null,
    usedCpuMilli: null,
    usedMemoryBytes: null,
    ...overrides,
  };
}

function toSummary(clusterState) {
  if (!clusterState) {
    return emptySummary({ error: "no cluster state" });
  }
  if (!clusterState.reachable) {
    return emptySummary({
      error:
        clusterState.error ||
        "cluster unreachable (kubeconfig or SSH to HaloRT K8s control plane)",
    });
  }
  return {
    ok: true,
    skipped: false,
    fetching: false,
    reachable: true,
    error: null,
    health: clusterState.health || null,
    nodeCount: clusterState.nodeCount,
    nodesReady: clusterState.nodesReady,
    access: clusterState.access,
    avgCpuPercent: clusterState.avgCpuPercent,
    avgMemoryPercent: clusterState.avgMemoryPercent,
    maxDiskPercent: clusterState.maxDiskPercent,
    clusterLoad1: clusterState.clusterLoad1,
    usedCpuMilli: clusterState.usedCpuMilli,
    usedMemoryBytes: clusterState.usedMemoryBytes,
  };
}

function loadFetchClusterHealth() {
  if (!fs.existsSync(HALORT_INFRA_ROOT)) {
    return {
      error: `halort-infra not found (${HALORT_INFRA_ROOT})`,
    };
  }
  const modulePath = clusterHealthModulePath(HALORT_INFRA_ROOT);
  if (!fs.existsSync(modulePath)) {
    return {
      error: `cluster-health.cjs missing in ${HALORT_INFRA_ROOT}`,
    };
  }
  try {
    const mod = require(modulePath);
    if (typeof mod.fetchClusterHealth !== "function") {
      return { error: "halort-infra cluster-health has no fetchClusterHealth" };
    }
    return { fetchClusterHealth: mod.fetchClusterHealth };
  } catch (err) {
    return { error: err.message || String(err) };
  }
}

async function loadUsage() {
  const loaded = loadFetchClusterHealth();
  if (loaded.error) {
    return emptySummary({ skipped: true, error: loaded.error });
  }
  try {
    const clusterState = await loaded.fetchClusterHealth();
    const summary = toSummary(clusterState);
    if (!summary.ok && !summary.skipped) {
      // kubeconfig/SSH often exist; failure is usually Hetzner firewall / network.
      const tip =
        "check Hetzner firewall allowlist for your public IP (SSH + 6443)";
      if (!summary.error || /unreachable|KUBECONFIG|SSH/i.test(summary.error)) {
        summary.error = tip;
      }
    }
    return summary;
  } catch (err) {
    return emptySummary({ error: err.message || String(err) });
  }
}

function startFetchIfNeeded() {
  if (inflight) return inflight;
  inflight = loadUsage()
    .then((summary) => {
      cache = { fetchedAt: Date.now(), summary };
      return summary;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function cacheIsFresh() {
  return Boolean(cache && Date.now() - cache.fetchedAt < DEFAULT_CACHE_MS);
}

/**
 * @param {{ wait?: boolean, force?: boolean }} [options]
 */
async function getHalortK8sUsage(options = {}) {
  const wait = Boolean(options.wait);
  const force = Boolean(options.force);

  if (!force && cacheIsFresh()) {
    return cache.summary;
  }

  const pending = startFetchIfNeeded();
  if (wait || !cache) {
    return pending;
  }
  return cache.summary;
}

function healthColor(level, { green, yellow, red, dim }) {
  if (level === "healthy") return green;
  if (level === "degraded") return red;
  if (level === "warning") return yellow;
  return dim;
}

function usageParts(summary) {
  const parts = [];
  if (summary.avgCpuPercent !== null && summary.avgCpuPercent !== undefined) {
    const cpuDetail = formatCpuUsage(summary.usedCpuMilli);
    parts.push(
      cpuDetail
        ? `CPU ${summary.avgCpuPercent}% avg (${cpuDetail} used)`
        : `CPU ${summary.avgCpuPercent}% avg`,
    );
  }
  if (summary.avgMemoryPercent !== null && summary.avgMemoryPercent !== undefined) {
    const memDetail = summary.usedMemoryBytes
      ? formatGiB(summary.usedMemoryBytes)
      : null;
    parts.push(
      memDetail
        ? `mem ${summary.avgMemoryPercent}% avg (${memDetail} used)`
        : `mem ${summary.avgMemoryPercent}% avg`,
    );
  }
  if (summary.maxDiskPercent !== null && summary.maxDiskPercent !== undefined) {
    parts.push(`disk max ${summary.maxDiskPercent}%`);
  }
  if (summary.clusterLoad1 !== null && summary.clusterLoad1 !== undefined) {
    parts.push(`load ${summary.clusterLoad1.toFixed(2)}`);
  }
  return parts;
}

/**
 * Compact HaloRT cluster lines for the dashboard box body.
 * @returns {string[]}
 */
function formatHalortK8sUsageLines(summary, colors = {}) {
  const green = colors.green || ((t) => t);
  const yellow = colors.yellow || ((t) => t);
  const red = colors.red || ((t) => t);
  const dim = colors.dim || ((t) => t);

  if (summary.fetching) {
    return [dim("HaloRT K8s · fetching…")];
  }

  if (summary.skipped) {
    return [dim(`HaloRT K8s · ${summary.error || "unavailable"}`)];
  }

  if (!summary.ok) {
    return [yellow(`HaloRT K8s · ${summary.error || "unreachable"}`)];
  }

  const label = summary.health?.label || "unknown";
  const colorFn = healthColor(summary.health?.level, { green, yellow, red, dim });
  const nodes =
    summary.nodeCount != null
      ? `${summary.nodesReady}/${summary.nodeCount} nodes`
      : "nodes —";
  const access = summary.access ? ` · ${summary.access}` : "";
  const head = `HaloRT K8s · ${colorFn(label)} · ${dim(nodes)}${dim(access)}`;

  const parts = usageParts(summary);
  if (parts.length === 0) {
    return [head];
  }
  return [head, dim(parts.join(" · "))];
}

function clusterBoxColor(summary, { green, yellow, red, dim }) {
  if (summary.skipped || summary.fetching) return dim;
  if (!summary.ok) return yellow;
  const level = summary.health?.level;
  if (level === "degraded") return red;
  if (level === "warning") return yellow;
  return green;
}

module.exports = {
  getHalortK8sUsage,
  formatHalortK8sUsageLines,
  clusterBoxColor,
};
