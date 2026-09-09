/**
 * Agent On Rails stack — sibling repos, local paths, and production endpoints.
 * Used by `npm run ci` (same operator pattern as suherman.net).
 */

const os = require("node:os");
const path = require("node:path");

const WORKSPACE_ROOT = path.resolve(
  process.env.AOR_WORKSPACE_ROOT ||
    path.join(os.homedir(), "src", "agent-on-rails"),
);

const CONTROL_PLANE_ROOT = path.resolve(__dirname, "..");

/** HaloRT infra (shared K3s probe used by `npm run ci`). */
const HALORT_INFRA_ROOT = path.resolve(
  process.env.HALORT_INFRA_ROOT ||
    path.join(os.homedir(), "src", "halort", "halort-infra"),
);

const GITHUB_ORG = "agent-on-rails";

/**
 * Sibling repos shown in `npm run ci`.
 * `dir` is the local checkout; GitHub Actions still work when the folder is missing.
 */
const REPOS = [
  {
    id: "control-plane",
    name: "agent-on-rails-control-plane",
    role: "Authority",
    dir: CONTROL_PLANE_ROOT,
    slug: `${GITHUB_ORG}/agent-on-rails-control-plane`,
  },
  {
    id: "website",
    name: "agent-on-rails-website",
    role: "Marketing site",
    dir: path.join(WORKSPACE_ROOT, "agent-on-rails-website"),
    slug: `${GITHUB_ORG}/agent-on-rails-website`,
  },
  {
    id: "cli",
    name: "agent-on-rails-cli",
    role: "Operator CLI",
    dir: path.join(WORKSPACE_ROOT, "agent-on-rails-cli"),
    slug: `${GITHUB_ORG}/agent-on-rails-cli`,
  },
  {
    id: "android",
    name: "agent-on-rails-android",
    role: "Android monitor",
    dir: path.join(WORKSPACE_ROOT, "agent-on-rails-android"),
    slug: `${GITHUB_ORG}/agent-on-rails-android`,
  },
  {
    id: "engine",
    name: "agent-on-rails-engine",
    role: "Orchestration",
    dir: path.join(WORKSPACE_ROOT, "agent-on-rails-engine"),
    slug: `${GITHUB_ORG}/agent-on-rails-engine`,
    planned: true,
  },
  {
    id: "github",
    name: "agent-on-rails-github",
    role: "GitHub App",
    dir: path.join(WORKSPACE_ROOT, "agent-on-rails-github"),
    slug: `${GITHUB_ORG}/agent-on-rails-github`,
    planned: true,
  },
  {
    id: "runtime",
    name: "agent-on-rails-agent-runtime",
    role: "Agent runtime",
    dir: path.join(WORKSPACE_ROOT, "agent-on-rails-agent-runtime"),
    slug: `${GITHUB_ORG}/agent-on-rails-agent-runtime`,
    planned: true,
  },
  {
    id: "infrastructure",
    name: "agent-on-rails-infrastructure",
    role: "Infra / HaloRT",
    dir: path.join(WORKSPACE_ROOT, "agent-on-rails-infrastructure"),
    slug: `${GITHUB_ORG}/agent-on-rails-infrastructure`,
    planned: true,
  },
];

const PRODUCTION_SERVICES = [
  {
    id: "website",
    label: "Marketing site",
    repoId: "website",
    publicUrl: "https://agent-on-rails.suherman.net",
  },
];

function getRepos() {
  return REPOS;
}

function getRepoById(id) {
  return REPOS.find((repo) => repo.id === id) || null;
}

function getProductionServices() {
  return PRODUCTION_SERVICES;
}

module.exports = {
  WORKSPACE_ROOT,
  CONTROL_PLANE_ROOT,
  HALORT_INFRA_ROOT,
  GITHUB_ORG,
  REPOS,
  PRODUCTION_SERVICES,
  getRepos,
  getRepoById,
  getProductionServices,
};
