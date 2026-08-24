"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "dist");
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sendFile(filePath, response) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  let pathname;

  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const requestedPath = path.resolve(root, relativePath);

  if (requestedPath !== root && !requestedPath.startsWith(root + path.sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(requestedPath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      sendFile(path.join(requestedPath, "index.html"), response);
      return;
    }
    sendFile(requestedPath, response);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log("Dr. Mo. Lab preview: http://localhost:" + port);
  console.log("Press Ctrl+C to stop.");
});

