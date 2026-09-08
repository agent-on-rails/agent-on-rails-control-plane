#!/usr/bin/env node
/**
 * Control-plane contract checks (schemas, spec/ADR IDs, relative Markdown links).
 *
 * Usage: npm run check
 */

const fs = require("node:fs");
const path = require("node:path");
const { CONTROL_PLANE_ROOT } = require("./stack-config.cjs");

const ROOT = CONTROL_PLANE_ROOT;

function walk(dir, predicate, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, acc);
    } else if (predicate(full, entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

function extractFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return null;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return null;
  return markdown.slice(3, end).trim();
}

function frontmatterField(block, key) {
  const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

function checkSchemas() {
  const findings = [];
  const files = walk(path.join(ROOT, "schemas"), (_, name) =>
    name.endsWith(".schema.json"),
  );
  if (files.length === 0) {
    findings.push({ ok: false, message: "no schemas/*.schema.json files found" });
    return findings;
  }
  const ids = new Set();
  for (const file of files) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (err) {
      findings.push({ ok: false, message: `${rel(file)}: invalid JSON (${err.message})` });
      continue;
    }
    if (!parsed || typeof parsed !== "object") {
      findings.push({ ok: false, message: `${rel(file)}: schema must be an object` });
      continue;
    }
    const schemaId = parsed.$id || rel(file);
    if (ids.has(schemaId)) {
      findings.push({ ok: false, message: `duplicate schema $id: ${schemaId}` });
    }
    ids.add(schemaId);
    findings.push({ ok: true, message: rel(file) });
  }
  return findings;
}

function checkSpecs() {
  const findings = [];
  const specsRoot = path.join(ROOT, "specs");
  const dirs = fs
    .readdirSync(specsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^AOR-\d{3}-/.test(entry.name));

  const ids = new Map();
  for (const dir of dirs) {
    const specPath = path.join(specsRoot, dir.name, "spec.md");
    if (!fs.existsSync(specPath)) {
      findings.push({ ok: false, message: `specs/${dir.name}/ missing spec.md` });
      continue;
    }
    const body = fs.readFileSync(specPath, "utf8");
    const fm = extractFrontmatter(body);
    if (!fm) {
      findings.push({
        ok: false,
        message: `${rel(specPath)}: missing YAML frontmatter`,
      });
      continue;
    }
    const id = frontmatterField(fm, "id");
    const folderId = dir.name.match(/^(AOR-\d{3})/)?.[1];
    if (!id) {
      findings.push({ ok: false, message: `${rel(specPath)}: missing id` });
      continue;
    }
    if (id !== folderId) {
      findings.push({
        ok: false,
        message: `${rel(specPath)}: id ${id} does not match folder ${folderId}`,
      });
    }
    if (ids.has(id)) {
      findings.push({
        ok: false,
        message: `duplicate spec id ${id} (${ids.get(id)} and ${rel(specPath)})`,
      });
    } else {
      ids.set(id, rel(specPath));
    }
    const required = ["acceptance.md", "evidence.md"];
    for (const name of required) {
      const sibling = path.join(specsRoot, dir.name, name);
      if (!fs.existsSync(sibling)) {
        findings.push({ ok: false, message: `specs/${dir.name}/ missing ${name}` });
      }
    }
    findings.push({ ok: true, message: `${id} ${dir.name}` });
  }
  return findings;
}

function checkAdrs() {
  const findings = [];
  const adrRoot = path.join(ROOT, "adr");
  const files = fs
    .readdirSync(adrRoot)
    .filter((name) => /^ADR-\d{3}-.+\.md$/.test(name))
    .sort();
  const ids = new Map();
  for (const name of files) {
    const id = name.match(/^(ADR-\d{3})/)?.[1];
    if (ids.has(id)) {
      findings.push({
        ok: false,
        message: `duplicate ADR id ${id} (${ids.get(id)} and adr/${name})`,
      });
    } else {
      ids.set(id, `adr/${name}`);
      findings.push({ ok: true, message: `adr/${name}` });
    }
  }
  return findings;
}

function markdownFiles() {
  return walk(ROOT, (full, name) => name.endsWith(".md"));
}

function extractMarkdownLinks(markdown) {
  const links = [];
  const re = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = re.exec(markdown))) {
    links.push({ text: match[1], href: match[2].trim() });
  }
  return links;
}

function isRelativeLink(href) {
  if (!href || href.startsWith("#")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false;
  return true;
}

function checkMarkdownLinks() {
  const findings = [];
  for (const file of markdownFiles()) {
    const markdown = fs.readFileSync(file, "utf8");
    for (const link of extractMarkdownLinks(markdown)) {
      if (!isRelativeLink(link.href)) continue;
      const [pathname] = link.href.split("#");
      const target = path.resolve(path.dirname(file), decodeURIComponent(pathname));
      if (!fs.existsSync(target)) {
        findings.push({
          ok: false,
          message: `${rel(file)}: broken link ${link.href}`,
        });
      }
    }
  }
  if (findings.length === 0) {
    findings.push({ ok: true, message: "relative Markdown links resolve" });
  }
  return findings;
}

function runChecks() {
  const sections = [
    { id: "schemas", title: "JSON schemas", findings: checkSchemas() },
    { id: "specs", title: "Spec IDs", findings: checkSpecs() },
    { id: "adrs", title: "ADR IDs", findings: checkAdrs() },
    { id: "links", title: "Markdown links", findings: checkMarkdownLinks() },
  ];
  const failed = sections.flatMap((section) =>
    section.findings.filter((finding) => !finding.ok),
  );
  return {
    ok: failed.length === 0,
    failed,
    sections,
  };
}

function printReport(result) {
  for (const section of result.sections) {
    const bad = section.findings.filter((finding) => !finding.ok);
    const good = section.findings.filter((finding) => finding.ok);
    if (bad.length === 0) {
      console.log(`✓ ${section.title} (${good.length})`);
    } else {
      console.log(`✗ ${section.title} (${bad.length} failed)`);
      for (const finding of bad) {
        console.log(`  ${finding.message}`);
      }
    }
  }
}

function main() {
  const result = runChecks();
  printReport(result);
  if (!result.ok) {
    process.exit(1);
  }
}

module.exports = { runChecks };

if (require.main === module) {
  main();
}
