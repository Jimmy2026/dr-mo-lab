#!/usr/bin/env node
/*
 * Portable CMS static-site generator.
 * Usage: node generate.js [path/to/content.json] [outputDir]
 * Defaults: ./content.json -> ./dist/
 */
const fs = require("fs");
const path = require("path");
const { render } = require("./template-engine.js");

const contentPath = process.argv[2] || path.join(__dirname, "content.json");
const outDir = process.argv[3] || path.join(__dirname, "dist");

function computeDerived(data) {
  // clone shallow-ish so we don't mutate the source content.json in memory permanently
  const d = JSON.parse(JSON.stringify(data));

  // team: display helpers
  function enrichMember(m) {
    m.hasLinks = !!(m.linkedinUrl || m.websiteUrl);
    m.hasPhoto = !!m.photo;
    m.initials = String(m.name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join("");
  }
  (d.team.current || []).forEach(enrichMember);
  (d.team.alumni || []).forEach(enrichMember);

  // publications: search text + counts
  const counts = { all: 0, journal: 0, conference: 0, dissertation: 0, magazine: 0 };
  (d.publications.items || []).forEach(p => {
    const raw = [p.title, p.authors, p.venue, p.year].join(" ").toLowerCase();
    p.searchText = raw.replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    counts.all++;
    if (counts[p.type] !== undefined) counts[p.type]++;
  });
  d.publications.counts = counts;

  // contact: icon flags + href presence flags
  (d.contact.items || []).forEach(c => {
    c.iconIsMail = c.iconType === "mail";
    c.iconIsPin = c.iconType === "pin";
    c.iconIsBuilding = c.iconType === "building";
    c.hrefMissing = !c.href;
  });

  return d;
}

function main() {
  const raw = fs.readFileSync(contentPath, "utf8");
  const data = JSON.parse(raw);
  const derived = computeDerived(data);

  const templatePath = path.join(__dirname, "template.html");
  const cssPath = path.join(__dirname, "styles.css");
  const jsPath = path.join(__dirname, "main.js");

  const template = fs.readFileSync(templatePath, "utf8");
  const css = fs.readFileSync(cssPath, "utf8");
  const js = fs.readFileSync(jsPath, "utf8");

  const html = render(template, Object.assign({}, derived, {
    CSS_BLOCK: css,
    JS_BLOCK: js
  }));

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

  // copy images/ next to output if present alongside content.json's directory
  const imagesSrc = path.join(path.dirname(contentPath), "images");
  const imagesDest = path.join(outDir, "images");
  if (fs.existsSync(imagesSrc)) {
    fs.mkdirSync(imagesDest, { recursive: true });
    for (const file of fs.readdirSync(imagesSrc)) {
      fs.copyFileSync(path.join(imagesSrc, file), path.join(imagesDest, file));
    }
  }

  console.log("Generated:", path.join(outDir, "index.html"));
  console.log("Publications:", derived.publications.items.length, "| Team current:", derived.team.current.length,
    "| Alumni:", derived.team.alumni.length);
}

main();
