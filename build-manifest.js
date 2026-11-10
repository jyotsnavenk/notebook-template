#!/usr/bin/env node
/* ============================================================
   Scans the Notes/ directory and writes notes.json, a manifest
   of folders and their markdown files. Run this whenever you
   add, rename, or remove notes:

       node build-manifest.js

   Title is taken from the first "# Heading" in each file,
   falling back to the filename.
   ============================================================ */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "Notes");
const OUT = path.join(__dirname, "notes.json");

// Folders kept on disk but excluded from the notebook (case-insensitive).
const IGNORE_FOLDERS = new Set(["ignore"]);

/* Reads a note's title (first "# Heading") and its optional front matter.
   Front matter is a YAML-ish block at the very top:
       ---
       order: 1
       description: A one-line summary shown on the landing page.
       hidden: true
       ---
   `order` controls sidebar position; notes with no order sort after ordered
   ones, then alphabetically. `description` is a one-line blurb shown under the
   note on the landing page (optional; surrounding quotes are stripped).
   `hidden: true` keeps the file on disk but leaves it out of the manifest
   entirely — not in the sidebar, never rendered. */
function metaFromFile(filePath, fallback) {
  let title = fallback;
  let order = null;
  let hidden = false;
  let description = "";
  try {
    const text = fs.readFileSync(filePath, "utf8");

    const fm = text.match(/^---\n([\s\S]*?)\n---/);
    if (fm) {
      const om = fm[1].match(/^\s*order\s*:\s*(-?\d+(?:\.\d+)?)\s*$/m);
      if (om) order = parseFloat(om[1]);
      const hid = fm[1].match(/^\s*hidden\s*:\s*(true|yes)\s*$/im);
      if (hid) hidden = true;
      const dm = fm[1].match(/^\s*description\s*:\s*(.+?)\s*$/m);
      if (dm) description = dm[1].trim().replace(/^["']|["']$/g, "").trim();
    }

    const hm = text.match(/^\s*#\s+(.+?)\s*$/m);
    if (hm) title = hm[1].trim();
  } catch (_) {}
  return { title, order, hidden, description };
}

function prettify(name) {
  return name
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function build() {
  if (!fs.existsSync(ROOT)) {
    console.error("No Notes/ directory found at", ROOT);
    process.exit(1);
  }

  // Folders render in this order. Any folder not listed here falls to the
  // end, alphabetically.
  const FOLDER_ORDER = ["Intro", "Notes", "Ideas"];
  const rank = (name) => {
    const i = FOLDER_ORDER.indexOf(name);
    return i === -1 ? FOLDER_ORDER.length : i;
  };

  const folders = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !IGNORE_FOLDERS.has(name.toLowerCase()))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  const manifest = [];

  for (const folder of folders) {
    const dir = path.join(ROOT, folder);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".md"));

    if (files.length === 0) continue;

    const notes = files
      .map((file) => {
        const full = path.join(dir, file);
        const relPath = `Notes/${folder}/${file}`;
        const { title, order, hidden, description } = metaFromFile(
          full,
          prettify(file)
        );
        return { title, path: relPath, order, hidden, description };
      })
      // Drop notes marked `hidden: true` — local-only, never on the web.
      .filter((n) => !n.hidden)
      // Explicit `order` first (ascending); unordered notes after, A→Z by title.
      .sort((a, b) => {
        if (a.order != null && b.order != null) return a.order - b.order;
        if (a.order != null) return -1;
        if (b.order != null) return 1;
        return a.title.localeCompare(b.title);
      })
      // Omit an empty description so notes.json stays tidy.
      .map(({ title, path, description }) =>
        description ? { title, path, description } : { title, path }
      );

    // Skip a folder whose notes are all hidden.
    if (notes.length === 0) continue;

    manifest.push({ folder, notes });
  }

  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
  const total = manifest.reduce((n, g) => n + g.notes.length, 0);
  console.log(
    `Wrote notes.json — ${manifest.length} folder(s), ${total} note(s).`
  );
}

build();
