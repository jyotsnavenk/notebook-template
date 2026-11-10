/* ============================================================
   Notebook — a static markdown reader
   Reads notes.json (a manifest of folders + files) and renders
   the selected .md file. Regenerate the manifest with:
       node build-manifest.js
   ============================================================ */

const els = {
  nav: document.getElementById("nav"),
  note: document.getElementById("note"),
  sidebar: document.getElementById("sidebar"),
};

let manifest = []; // [{ folder, notes: [{ title, path }] }]
let flatNotes = []; // [{ title, path, folder }]

/* ---------- Markdown configuration ---------- */
marked.setOptions({ gfm: true, breaks: false });

/* No indented code blocks: code only ever comes from ``` fences. A block that
   is indented 4+ spaces (say, a numbered list nudged in under a heading) is
   dedented and parsed as ordinary markdown instead of becoming a <pre>. Only
   fires where markdown would otherwise start an indented code block, so list
   continuations and nested bullets are untouched. */
marked.use({
  extensions: [
    {
      name: "indentedBlock",
      level: "block",
      tokenizer(src) {
        const m = src.match(/^(?: {4,}|\t)[^\n]*(?:\n(?:[ \t]*(?=\n)|(?: {4,}|\t)[^\n]*))*/);
        if (!m) return;
        const raw = m[0];
        const lines = raw.split("\n");
        const cut = Math.min(
          ...lines
            .filter((l) => l.trim())
            .map((l) => l.replace(/\t/g, "    ").match(/^ */)[0].length)
        );
        const body = lines
          .map((l) => l.replace(/\t/g, "    ").slice(cut))
          .join("\n");
        return {
          type: "indentedBlock",
          raw,
          tokens: this.lexer.blockTokens(body, []),
        };
      },
      renderer(token) {
        return this.parser.parse(token.tokens);
      },
    },
  ],
});

/* Custom callout syntax:
     > [!note] Optional Title
     > body line
     > body line
   Rendered as a styled .callout block. */
function preprocessCallouts(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^>\s*\[!(\w+)\]\s*(.*)$/);
    if (m) {
      const type = m[1].toLowerCase();
      const title = m[2].trim();
      const body = [];
      i++;
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const label = title || type;
      const cls = type === "warn" || type === "warning" ? " callout-warn" : "";
      const inner = marked.parse(body.join("\n"));
      out.push(
        `<div class="callout${cls}"><div class="callout-label">${escapeHtml(
          label
        )}</div>${inner}</div>`
      );
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n");
}

/* Half divider: a line that is just "--" becomes a short rule, a third of
   the column wide, for a lighter break than a full "---" rule. Done before
   parsing because markdown would read "--" under a paragraph as a heading
   underline. Fenced code blocks are left alone. */
function preprocessHalfDividers(md) {
  let inFence = false;
  return md
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (!inFence && /^\s*--\s*$/.test(line))
        return '\n<hr class="hr-half" />\n';
      return line;
    })
    .join("\n");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

/* Citations (sidenotes), written with footnote syntax:
     The claim I pulled from somewhere.[^chiang]

     [^chiang]: Explanation of the source, with a [link](https://...).
   The definition can sit anywhere in the note (indent following lines to
   continue it). Each marker becomes a superscript number, and its definition
   is shown in the right-hand margin beside it, outside the content column.
   Numbers are assigned in reading order, whatever the labels are. On screens
   too narrow for a margin, the notes are listed at the end instead. */
let footnoteDefs = new Map(); // label -> markdown text, for the note being rendered

function extractFootnoteDefs(md) {
  footnoteDefs = new Map();
  const lines = md.split("\n");
  const out = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) inFence = !inFence;
    const m = !inFence && lines[i].match(/^\[\^([^\]\s]+)\]:\s*(.*)$/);
    if (!m) {
      out.push(lines[i]);
      continue;
    }
    const text = [m[2]];
    while (i + 1 < lines.length && /^( {2,}|\t)\S/.test(lines[i + 1])) {
      text.push(lines[++i].trim());
    }
    footnoteDefs.set(m[1], text.join(" "));
  }
  return out.join("\n");
}

// Markers render as placeholders; numberSidenotes fills them in afterwards so
// numbering follows document order (callouts are parsed ahead of the body).
marked.use({
  extensions: [
    {
      name: "sidenoteRef",
      level: "inline",
      start: (src) => src.indexOf("[^"),
      tokenizer(src) {
        const m = src.match(/^\[\^([^\]\s]+)\]/);
        if (m && footnoteDefs.has(m[1])) {
          return { type: "sidenoteRef", raw: m[0], label: m[1] };
        }
      },
      renderer: (token) =>
        `<sup class="sidenote-ref" data-fn="${escapeHtml(token.label)}"></sup>`,
    },
  ],
});

function numberSidenotes(html) {
  const numbers = new Map(); // label -> number
  const notes = []; // inner html of each note, by number
  html = html.replace(
    /<sup class="sidenote-ref" data-fn="([^"]*)"><\/sup>/g,
    (_, label) => {
      const ref = (n) =>
        `<sup class="sidenote-ref"><a href="#fn-${n}" data-fn="${n}">${n}</a></sup>`;
      if (numbers.has(label)) return ref(numbers.get(label));
      const n = numbers.size + 1;
      numbers.set(label, n);
      // Links in a citation open in a new tab, so the note stays open.
      const body = marked
        .parseInline(footnoteDefs.get(unescapeHtml(label)))
        .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
      notes.push(body);
      return `${ref(n)}<span class="sidenote"><sup>${n}</sup> ${body}</span>`;
    }
  );
  if (notes.length === 0) return html;
  const list = notes
    .map((body, i) => `<li id="fn-${i + 1}">${body}</li>`)
    .join("");
  return `${html}<ol class="footnotes">${list}</ol>`;
}

/* Hover notes, written like a link with the popover text in braces:
     Insurers cap their [exposure per campus]{Per-line limits sit in the low
     single-digit billions, so cover is stacked across carriers.}.
   The bracketed text gets a dotted underline; hovering it opens a popover
   right above it with the braced text (inline markdown and links work in
   both). The popover's content is kept in a <template> inside the underline,
   so it never shows up in the page text (or a heading's TOC label). */
function scanBraces(src, open) {
  // Index just past the "}" matching the "{" at `open`, or -1. Nested
  // braces in the content are allowed as long as they balance.
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return i + 1;
  }
  return -1;
}

/* A hover note whose braced text runs over several lines (say, an intro line
   and then a bullet list) would get split apart by the block parser before
   the inline extension ever sees it. So those are pulled out up front: their
   content is rendered as full markdown (lists, paragraphs) and swapped for a
   placeholder that the inline extension below swaps back. */
let hovernoteBlocks = []; // rendered HTML, indexed by placeholder number

// The braced text is often indented to sit under a list item in the note;
// strip the indent its lines share, or markdown would read an indented
// "- item" as a continuation of the line before rather than a bullet.
function dedent(text) {
  const lines = text.trim().split("\n");
  const indents = lines
    .slice(1)
    .filter((l) => l.trim())
    .map((l) => l.match(/^[ \t]*/)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return [lines[0], ...lines.slice(1).map((l) => l.slice(cut))].join("\n");
}

function extractMultilineHovernotes(md) {
  hovernoteBlocks = [];
  let out = "";
  let i = 0;
  const re = /\[([^\]^\n][^\]\n]*)\]\{/g;
  let m;
  while ((m = re.exec(md))) {
    const open = m.index + m[0].length - 1;
    const end = scanBraces(md, open);
    if (end === -1) continue;
    const content = dedent(md.slice(open + 1, end - 1));
    if (!content.includes("\n")) continue;
    const body = marked
      .parse(content)
      .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    hovernoteBlocks.push(body);
    out += md.slice(i, open) + `{@@hovernote-${hovernoteBlocks.length - 1}@@}`;
    i = end;
    re.lastIndex = end;
  }
  return out + md.slice(i);
}

marked.use({
  extensions: [
    {
      name: "hovernote",
      level: "inline",
      start: (src) => src.match(/\[[^\]^]/)?.index,
      tokenizer(src) {
        const m = src.match(/^\[([^\]^][^\]]*)\]\{/);
        if (!m) return;
        const end = scanBraces(src, m[0].length - 1);
        if (end === -1) return;
        const content = src.slice(m[0].length, end - 1).trim();
        if (!content) return;
        return {
          type: "hovernote",
          raw: src.slice(0, end),
          content,
          tokens: this.lexer.inlineTokens(m[1]),
        };
      },
      renderer(token) {
        // Links in a hover note open in a new tab, like citations.
        const block = token.content.match(/^@@hovernote-(\d+)@@$/);
        const body = block
          ? hovernoteBlocks[Number(block[1])]
          : marked
              .parseInline(token.content)
              .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
        return `<span class="hovernote" tabindex="0">${this.parser.parseInline(
          token.tokens
        )}<template>${body}</template></span>`;
      },
    },
  ],
});

/* One shared popover, filled from whichever hover note is under the pointer
   (or focused) and placed just above the line it's on. It closes as soon as
   the pointer leaves the underline. While it's open, a white blurred backdrop
   fades in over everything but the underline and the popover. */
const hovernoteBackdrop = document.createElement("div");
hovernoteBackdrop.className = "hovernote-backdrop";
document.body.appendChild(hovernoteBackdrop);

const hovernotePop = document.createElement("div");
hovernotePop.className = "hovernote-pop";
hovernotePop.id = "hovernote-pop";
hovernotePop.setAttribute("role", "tooltip");
hovernotePop.hidden = true;
document.body.appendChild(hovernotePop);
let activeHovernote = null;

const HOVERNOTE_GAP = 12; // px between the underline and the popover (room for the notch)
const HOVERNOTE_EDGE = 12; // px the popover keeps from the viewport edges
const HOVERNOTE_NOTCH_INSET = 16; // px the notch keeps from the popover's sides
const HOVERNOTE_WIDE_CHARS = 200; // notes longer than this get the wider popover

function showHovernote(el, pointerY) {
  activeHovernote?.classList.remove("is-active");
  activeHovernote = el;
  el.classList.add("is-active");
  hovernoteBackdrop.classList.add("is-visible");
  hovernotePop.innerHTML = el.querySelector("template").innerHTML;
  // Longer notes get a wider popover so they don't turn into a tall column.
  hovernotePop.classList.toggle(
    "is-wide",
    hovernotePop.textContent.length > HOVERNOTE_WIDE_CHARS
  );
  hovernotePop.hidden = false;
  el.setAttribute("aria-describedby", hovernotePop.id);

  // An underline that wraps has one rect per line; anchor to the line being
  // hovered (or the first line, when focused from the keyboard).
  const rects = Array.from(el.getClientRects());
  const rect =
    (pointerY != null &&
      rects.find((r) => pointerY >= r.top && pointerY <= r.bottom)) ||
    rects[0];
  const pop = hovernotePop.getBoundingClientRect();

  const maxLeft = window.innerWidth - pop.width - HOVERNOTE_EDGE;
  const left = Math.max(
    HOVERNOTE_EDGE,
    Math.min(rect.left + rect.width / 2 - pop.width / 2, maxLeft)
  );
  // Above the line; flip below only if it would run off the top of the view.
  let top = rect.top - pop.height - HOVERNOTE_GAP;
  const below = top < HOVERNOTE_EDGE;
  if (below) top = rect.bottom + HOVERNOTE_GAP;

  // The notch points at the middle of the underline, even when the popover
  // has been nudged in from a viewport edge, but stays clear of its corners.
  const notchX = Math.max(
    HOVERNOTE_NOTCH_INSET,
    Math.min(rect.left + rect.width / 2 - left, pop.width - HOVERNOTE_NOTCH_INSET)
  );
  hovernotePop.style.setProperty("--notch-x", `${notchX}px`);
  hovernotePop.classList.toggle("is-below", below);

  hovernotePop.style.left = `${left + window.scrollX}px`;
  hovernotePop.style.top = `${top + window.scrollY}px`;
}

function hideHovernote() {
  if (!activeHovernote) return;
  activeHovernote.removeAttribute("aria-describedby");
  activeHovernote.classList.remove("is-active");
  activeHovernote = null;
  hovernoteBackdrop.classList.remove("is-visible");
  hovernotePop.hidden = true;
}

document.addEventListener("mouseover", (e) => {
  const el = e.target.closest(".hovernote");
  if (el && el !== activeHovernote) showHovernote(el, e.clientY);
});
document.addEventListener("mouseout", (e) => {
  const el = e.target.closest(".hovernote");
  if (el && !el.contains(e.relatedTarget)) hideHovernote();
});
document.addEventListener("focusin", (e) => {
  const el = e.target.closest(".hovernote");
  if (el) showHovernote(el);
});
document.addEventListener("focusout", (e) => {
  if (e.target.closest(".hovernote")) hideHovernote();
});

function unescapeHtml(s) {
  return s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    "#39": "'",
  }[e]));
}

function renderMarkdown(md) {
  // Strip a leading YAML-ish front matter block if present.
  md = md.replace(/^---\n[\s\S]*?\n---\n/, "");
  const withCallouts = preprocessCallouts(
    extractMultilineHovernotes(extractFootnoteDefs(preprocessHalfDividers(md)))
  );
  // Wrap h1 text in a span so its hatched highlight hugs each line when it wraps.
  return numberSidenotes(marked.parse(withCallouts)).replace(
    /(<h1[^>]*>)([\s\S]*?)(<\/h1>)/g,
    "$1<span>$2</span>$3"
  );
}

/* ---------- Navigation ----------
   On a note page the sidebar is a table of contents of that page: one
   link per H2 heading, with "↩ Index" (the brand link) above it returning
   to the landing page. The landing page itself has no sidebar. */
/* The page slug is the markdown file's own name, without its folder
   or extension (e.g. "Notes/Ideas/example-idea.md" -> "example-idea"). */
function slugFromPath(path) {
  return path
    .split("/")
    .pop()
    .replace(/\.mdx?$/i, "")
    .toLowerCase();
}

function noteBySlug(slug) {
  return flatNotes.find((n) => slugFromPath(n.path) === slug);
}

/* The current page slug comes from the URL path, e.g. "/example-idea". */
function currentSlug() {
  return decodeURIComponent(location.pathname.replace(/^\/+/, ""));
}

/* Turn an H2's text into a URL-safe anchor id, e.g. "Multiplayer AI" ->
   "multiplayer-ai". */
function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* The H2s of the note currently in view — set by buildTocNav, read by the
   scrollspy to highlight the section you're reading. */
let tocHeadings = [];

/* When a TOC link is clicked, the smooth-scroll fires scroll events that would
   run the scrollspy mid-animation and steal the highlight from the clicked
   section — end-of-page sections especially, since they can't scroll up to the
   trigger line. Pin the clicked section as active until the user scrolls of
   their own accord (cleared by the wheel/touch/key listeners below). */
let tocClickLocked = false;

/* Build the sidebar from the current note's H2 headings. Each heading gets a
   unique id so its TOC link can anchor to it. With no H2s the nav is left
   empty (just the "↩ Index" brand link above it). */
function buildTocNav() {
  els.nav.innerHTML = "";
  tocClickLocked = false; // a fresh note — let the scrollspy drive again
  tocHeadings = Array.from(els.note.querySelectorAll("h2"));

  if (tocHeadings.length === 0) return;

  const group = document.createElement("div");
  group.className = "nav-group";

  const used = new Set();
  tocHeadings.forEach((h) => {
    const label = h.textContent.trim();
    const base = slugifyHeading(label) || "section";
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    h.id = id;

    const link = document.createElement("a");
    link.className = "nav-link toc-nav-link";
    link.textContent = label;
    link.href = "#" + id;
    link.dataset.target = id;
    group.appendChild(link);
  });

  els.nav.appendChild(group);
  updateTocActive();

  // Honor a section hash on direct load (e.g. /formatting#citations): the ids
  // only exist now, after the note rendered, so the browser couldn't scroll
  // there on its own.
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView({ block: "start" });
  }
}

/* Highlight the TOC link for the section currently at the top of the view —
   the last heading that has scrolled past the trigger line. */
function updateTocActive() {
  if (tocHeadings.length === 0) return;
  if (tocClickLocked) return; // a click set the active link; hold until user scrolls
  const trigger = 140; // px below the top of the viewport
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Absolute document offset of each heading's top (independent of scroll).
  const tops = tocHeadings.map((h) => h.getBoundingClientRect().top + scrollTop);

  // Base rule: the active section is the last heading that has scrolled past
  // the trigger line.
  let activeIndex = 0;
  for (let i = 0; i < tops.length; i++) {
    if (tops[i] - trigger <= scrollTop) activeIndex = i;
    else break;
  }

  // Headings near the end of the page can't scroll up to the trigger line — the
  // page runs out of scroll before they reach it. Jumping straight to the last
  // heading at the bottom skips every heading in between. Instead, treat the
  // final stretch of scroll as a progress bar and hand the active state to each
  // unreachable heading in turn, so the last one lights up exactly at the bottom.
  let firstUnreachable = tops.length;
  for (let i = 0; i < tops.length; i++) {
    if (tops[i] - trigger > maxScroll) {
      firstUnreachable = i;
      break;
    }
  }
  if (firstUnreachable < tops.length && maxScroll > 0) {
    const anchor = Math.max(0, firstUnreachable - 1); // last reachable heading
    const startScroll = Math.max(0, tops[anchor] - trigger);
    const span = maxScroll - startScroll;
    if (scrollTop >= startScroll && span > 0) {
      const count = tops.length - anchor; // anchor + the trailing unreachable ones
      const progress = Math.min(1, (scrollTop - startScroll) / span);
      activeIndex = Math.max(activeIndex, anchor + Math.round(progress * (count - 1)));
    }
  }

  const activeId = tocHeadings[activeIndex].id;
  document.querySelectorAll(".toc-nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.target === activeId);
  });
}

/* ---------- Landing page (table of contents) ----------
   The root route (/) renders a table of contents instead of a note:
   notes grouped by folder, each folder an <h3>, each note a link to its
   page. Titles and one-line descriptions are synced live from the actual
   markdown, mirroring the sidebar's syncNavLabelsToHeadings. */
function renderLanding() {
  document.title = "Notebook";
  // The landing page hides the sidebar (see styles.css); clear any TOC left
  // over from a note page so it never lingers.
  els.nav.innerHTML = "";
  tocHeadings = [];

  if (manifest.length === 0) {
    els.note.innerHTML =
      `<div class="empty-state"><p>No notes found.</p></div>`;
    return;
  }

  const groups = manifest
    .map((group) => {
      const items = group.notes
        .map((n) => {
          const slug = slugFromPath(n.path);
          return `<li class="toc-item">
            <a class="toc-link" href="/${encodeURIComponent(slug)}"
               data-slug="${escapeHtml(slug)}" data-path="${escapeHtml(n.path)}">
              <span class="toc-title">${escapeHtml(n.title)}</span>
            </a>
          </li>`;
        })
        .join("");
      return `<section class="toc-group">
        <h3 class="toc-folder">${escapeHtml(group.folder)}</h3>
        <ul class="toc-list">${items}</ul>
      </section>`;
    })
    .join("");

  els.note.innerHTML = `<div class="landing">
    <div class="note-header"><h1><span>Notebook</span></h1></div>
    ${groups}
  </div>`;

  updateNavCollapse();
  syncLandingContent();
}

/* Keep each landing entry's title matched to its note, fetched live so the TOC
   never drifts from the manifest's build-time values: the title is taken from
   the note's H1. This means renaming a note shows up on refresh without
   rebuilding the manifest. Falls back to the manifest values on any error. */
function syncLandingContent() {
  document.querySelectorAll(".toc-link").forEach(async (link) => {
    try {
      const res = await fetch(link.dataset.path);
      if (!res.ok) return;
      const md = await res.text();
      const titleEl = link.querySelector(".toc-title");
      const hm = md.match(/^\s*#\s+(.+?)\s*$/m);
      if (hm && hm[1].trim() && titleEl) titleEl.textContent = hm[1].trim();
    } catch (_) {
      /* keep the manifest values on any error */
    }
  });
}

/* ---------- Load a note ---------- */
async function loadNote(path) {
  const meta = flatNotes.find((n) => n.path === path);
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    const md = await res.text();
    const html = renderMarkdown(md);
    const metaLine = meta
      ? `<span class="note-meta">${escapeHtml(meta.folder)}</span>`
      : "";
    // Pull the first <h1> onto one row with the meta, like a title + date line.
    const h1Match = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
    if (h1Match) {
      const header = `<div class="note-header">${h1Match[0]}${metaLine}</div>`;
      els.note.innerHTML = html.replace(h1Match[0], header);
    } else {
      els.note.innerHTML =
        `<div class="note-header">${metaLine}</div>` + html;
    }
    els.note.scrollIntoView({ block: "start" });
    document.title = (meta ? meta.title : "Notebook") + " — Notebook";
  } catch (err) {
    els.note.innerHTML = `<div class="empty-state"><p>Couldn't load this note.</p><p style="font-size:0.85rem">${escapeHtml(
      String(err)
    )}</p></div>`;
  }
  buildTocNav();
  updateNavCollapse();
}

/* ---------- Routing ----------
   Path-based: "/example-idea" selects the note whose file is example-idea.md.
   Nav clicks are intercepted and pushed to history so navigation stays a
   single-page swap; a direct hit or refresh of "/example-idea" is handled by
   the server's SPA fallback. */
function navigateTo(slug, { replace = false } = {}) {
  const url = "/" + encodeURIComponent(slug);
  if (location.pathname !== url) {
    history[replace ? "replaceState" : "pushState"](null, "", url);
  }
  handleRoute();
}

function handleRoute() {
  const slug = currentSlug();
  if (!slug) {
    renderLanding();
    return;
  }
  const note = noteBySlug(slug);
  if (note) loadNote(note.path);
  else renderLanding(); // unknown route falls back to the landing page
}

/* ---------- Responsive nav collapse ----------
   The sidebar floats over the page's left margin while the note container is
   centered in the full viewport, so as the viewport narrows the centered
   container drifts left toward the sidebar. Once the gap between them closes,
   the sidebar is removed and the "↩ Index" link reappears at the top of the
   page (see .app.nav-collapsed in styles.css).

   The trigger is geometric rather than a fixed breakpoint, because the
   sidebar's width depends on the current note's table of contents. Each pass
   first drops the collapsed state so the sidebar can be measured at its true
   width, reads the gap to the container, then re-collapses if it's too small.
   This runs synchronously, so the browser never paints the intermediate
   uncollapsed state. */
const NAV_COLLAPSE_GAP = 48; // px of clearance required between nav and container

function updateNavCollapse() {
  const app = els.sidebar.parentElement;
  // The landing page has no sidebar (hidden in CSS); never collapse there.
  if (els.note.querySelector(".landing")) {
    app.classList.remove("nav-collapsed");
    return;
  }
  app.classList.remove("nav-collapsed");
  const gap =
    els.note.getBoundingClientRect().left -
    els.sidebar.getBoundingClientRect().right;
  if (gap < NAV_COLLAPSE_GAP) app.classList.add("nav-collapsed");
}

// Re-evaluate on resize, coalesced to one check per animation frame.
let navCollapseRaf = 0;
window.addEventListener("resize", () => {
  if (navCollapseRaf) return;
  navCollapseRaf = requestAnimationFrame(() => {
    navCollapseRaf = 0;
    updateNavCollapse();
  });
});

/* ---------- On scroll: fade state + TOC scrollspy ---------- */
function updateNavScrollState() {
  els.nav.classList.toggle("scrolled", window.scrollY > 0);
}
function onScroll() {
  updateNavScrollState();
  updateTocActive();
}
window.addEventListener("scroll", onScroll, { passive: true });
// A real scroll gesture (not the click's programmatic smooth-scroll) releases
// the click lock, handing the highlight back to the scrollspy.
["wheel", "touchmove", "keydown"].forEach((evt) =>
  window.addEventListener(evt, () => { tocClickLocked = false; }, { passive: true })
);
updateNavScrollState();

/* ---------- Boot ---------- */
async function init() {
  try {
    const res = await fetch("notes.json");
    if (!res.ok) throw new Error("notes.json " + res.status);
    manifest = await res.json();
  } catch (err) {
    els.nav.innerHTML = `<p class="nav-empty">Couldn't load notes.json.<br />Run <code>node build-manifest.js</code> and serve over http.</p>`;
    return;
  }

  flatNotes = manifest.flatMap((g) =>
    g.notes.map((n) => ({ ...n, folder: g.folder }))
  );

  // Intercept in-page links for single-page navigation; back/forward via
  // popstate. Three cases, in order:
  //   1. a TOC link (sidebar section anchor) → smooth-scroll to its heading.
  //   2. a citation number → smooth-scroll to its note in the end list.
  //   3. a landing TOC link or the "↩ Index" brand → swap route.
  //   4. anything else (external links in notes) passes through untouched.
  document.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const toc = e.target.closest("a.toc-nav-link");
    if (toc) {
      e.preventDefault();
      const target = document.getElementById(toc.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Keep the current path (a bare "#id" would resolve against <base
        // href="/"> and drop the note slug, breaking reload).
        history.replaceState(null, "", location.pathname + "#" + toc.dataset.target);
        // Highlight the clicked section right away and hold it (see
        // tocClickLocked) until the user scrolls themselves.
        tocClickLocked = true;
        document.querySelectorAll(".toc-nav-link").forEach((a) => {
          a.classList.toggle("active", a === toc);
        });
      }
      return;
    }

    // A citation number: on narrow screens its note is in the end list, so
    // jump there (the bare "#fn-N" would resolve against <base href="/">).
    const cite = e.target.closest(".sidenote-ref a");
    if (cite) {
      e.preventDefault();
      const target = document.getElementById("fn-" + cite.dataset.fn);
      if (target && target.offsetParent) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const link = e.target.closest("a[data-slug], a.brand");
    if (!link) return;
    e.preventDefault();
    navigateTo(link.classList.contains("brand") ? "" : link.dataset.slug);
  });
  window.addEventListener("popstate", handleRoute);

  // Root (/) shows the landing table of contents; any other route loads its note.
  handleRoute();
}

init();
