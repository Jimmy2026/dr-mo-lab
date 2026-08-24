#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const dir = __dirname;

const scaffold = fs.readFileSync(path.join(dir, "admin-src.html"), "utf8");
const content = fs.readFileSync(path.join(dir, "content.json"), "utf8");
const template = fs.readFileSync(path.join(dir, "template.html"), "utf8");
const css = fs.readFileSync(path.join(dir, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(dir, "main.js"), "utf8");

// Escape "</script" sequences so embedding these strings inside admin-src.html's
// own <script> block doesn't cause the HTML parser to close it prematurely.
function safeStringify(str) {
  return JSON.stringify(str).replace(/<\/script/gi, "<\\/script");
}

let out = scaffold
  .replace("/*__DEFAULT_CONTENT__*/ null", JSON.stringify(JSON.parse(content)))
  .replace('/*__TEMPLATE_HTML__*/ ""', safeStringify(template))
  .replace('/*__SITE_CSS__*/ ""', safeStringify(css))
  .replace('/*__SITE_JS__*/ ""', safeStringify(js));

fs.writeFileSync(path.join(dir, "admin.html"), out, "utf8");
console.log("Built admin.html —", (out.length / 1024).toFixed(0) + "KB");
