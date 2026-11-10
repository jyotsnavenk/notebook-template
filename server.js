#!/usr/bin/env node
/* ============================================================
   A tiny zero-dependency static file server for the notebook.
   Run with:  npm run dev   (or: node server.js)
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 8000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  // Decode and strip query string.
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  // Resolve safely inside ROOT (block path traversal).
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback: a path with no file extension (e.g. /example-idea) is a
      // client-side route, so serve index.html and let app.js handle it.
      if (!path.extname(urlPath)) {
        res.writeHead(200, {
          "Content-Type": TYPES[".html"],
          "Cache-Control": "no-store",
        });
        fs.createReadStream(path.join(ROOT, "index.html")).pipe(res);
        return;
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found: " + urlPath);
      return;
    }
    const type = TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    // no-store: always serve the latest CSS/JS/notes while editing.
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Notebook running at http://localhost:${PORT}`);
});
