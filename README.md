# Cozy Notebook Template

A simple web-based notebook for reading markdown notes & content management. 

I tend to prefer reading essays/articles on the web than *always-in-progress* notes on Notion. This Notebook came from the idea that I can have in progress notes that look polished, something I can continue to revisit.

## Features

- A table-of-contents page that lists every note, grouped by folder
- A left sidebar on each note with its sections, highlighted as you scroll
- Citations in the right margin, notes on hover, callouts, tables and images
- Plain markdown files in folders, so your notes stay portable
- No dependencies to install and no framework, just HTML, CSS and JavaScript

## Quick Start

You need [Node.js](https://nodejs.org) (which comes with npm) installed. Check
with `node -v`.

1. Click **Use this template** (or fork the repository), then clone your copy:

   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Visit <http://localhost:8000>. To use a different port, run
   `PORT=3000 npm run dev`.

There's no `npm install` step: the project has no npm dependencies. The server
uses only Node's built-in modules, and the markdown parser
([marked](https://marked.js.org)) loads from a CDN in the browser.

Because the app fetches files, open it through the local server, not by
double-clicking `index.html` (`file://` won't work).

## Customization

### Updating the notebook info

- **Name:** "Notebook" is set in `index.html` (the `<title>`) and in `app.js`
  (the landing page heading and page titles).
- **Look:** colors, fonts and widths are the variables at the top of
  `styles.css`.
- **Example pages:** the three included notes are filler. Replace or delete them:
  - **Overview** (`Notes/Intro/overview.md`): a short introduction to your notebook.
  - **Formatting Reference** (`Notes/Notes/formatting.md`): every markdown rule the notebook supports.
  - **Example Idea** (`Notes/Ideas/example-idea.md`): a longer note that uses them together.

### Adding a note

1. Create a `.md` file inside any folder in `Notes/`.
2. Give it a title with a top-level `# Heading`. That's what shows on the
   index page. Each `## Heading` becomes a link in the note's sidebar.
3. Rebuild the manifest so the note shows up:

   ```bash
   npm run build
   ```

A note's address is its file name: `Notes/Ideas/example-idea.md` is served at
`/example-idea`, so keep file names unique across folders.

Optional front matter at the top of a note:

```markdown
---
order: 1
hidden: true
---
```

- `order` sets the note's position in its folder. Notes without one come after,
  A–Z by title.
- `hidden: true` keeps the file on disk but out of the notebook.

### Adding a folder

1. Make a new folder inside `Notes/`, for example `Notes/Reading/`, and put at
   least one `.md` file in it (empty folders are skipped).
2. Run `npm run build`.

The folder name becomes its heading on the index page. To set the order of
folders, edit `FOLDER_ORDER` in `build-manifest.js`; folders not listed there
come last, alphabetically. A folder named `Ignore` is skipped entirely, which
is handy for drafts.

### Custom formatting

Everything in GitHub-flavored markdown works, plus:

```markdown
> [!note] Optional Title
> A callout. Use [!warn] for a warning.

A claim with a citation[^source], shown in the right margin.

[^source]: Author, *Title*. [Read it](https://example.com).

A [hover note]{The text in braces opens in a popover above the underline.}.

![Alt text describing the image](Notes/Ideas/images/diagram.svg)

--
```

- **Callouts:** `[!note]` or `[!warn]` on the first line of a quote.
- **Citations:** footnote syntax, rendered as numbered notes in the right margin.
- **Hover notes:** `[text]{note}` underlines the text and shows the note on hover.
- **Images:** put them in an `images/` folder next to the note and write the
  path from the project root.
- **Half divider:** a line with just `--` draws a divider a third of the column
  wide.

See `Notes/Notes/formatting.md` (or the Formatting Reference page in the
running app) for the full reference with live examples.

## How it works

The workflow is **write → build → read**:

1. **Write** markdown files in `Notes/`.
2. **Build:** `npm run build` runs `build-manifest.js`, which scans the folders,
   reads each note's title and front matter, and writes `notes.json`. Run it
   whenever you add, rename or remove a note or folder. Edits to an existing
   note's content show up on refresh without a rebuild.
3. **Read:** `app.js` loads `notes.json` to draw the index page, then fetches
   and renders each note in the browser.

### Tech stack

- Plain HTML, CSS and JavaScript, with no framework and no bundler
- [marked](https://marked.js.org) for markdown, extended in `app.js` for
  callouts, citations and hover notes
- Node.js for the local dev server and the manifest script, both
  dependency-free

### Project structure

```
.
├── index.html          # the app shell
├── styles.css          # all styling + design tokens
├── app.js              # loads & renders notes
├── server.js           # tiny static server for local use
├── build-manifest.js   # scans Notes/ → notes.json
├── notes.json          # generated list of notes (don't edit by hand)
└── Notes/              # your notebook
    ├── Intro/
    │   └── overview.md
    ├── Notes/
    │   ├── formatting.md
    │   └── images/
    └── Ideas/
        └── example-idea.md
```

### Deploying

The site is fully static, so any static host works (GitHub Pages, Netlify,
Vercel, Cloudflare Pages). Run `npm run build` and commit `notes.json` before
deploying. One requirement: unknown paths must fall back to `index.html`,
since pages use paths like `/example-idea`. On Netlify or Cloudflare Pages
that's a `_redirects` file with `/* /index.html 200`; on GitHub Pages, copy
`index.html` to `404.html`.
