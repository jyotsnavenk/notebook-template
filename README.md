# Cozy Notebook Template

A simple web-based notebook for reading markdown notes & content management. 

I tend to prefer reading essays/articles on the web than read *always-in-progress* notes on Notion. This Notebook came from the idea that I can have in progress notes that look polished, something I can continue to revisit.

## What you get

- An table-of-contents page that lists every note, grouped by folder
- A left sidebar on each note with its sections, highlighted as you scroll
- Fun features: Citations in the right margin, notes on hover, callouts, tables.

## Quick Start

1. Click **Use this template** (or fork the repository) and clone your copy.
2. Run it:

   ```bash
   npm run dev
   ```

3. Visit <http://localhost:8000> (set a different port with `PORT=3000 npm run dev`).

Because the app fetches files, open it through the local server, not `file://`.

## Structure

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

The three example pages are filler:

- **Overview** is a short page to replace with your own introduction.
- **Formatting Reference** shows every markdown rule the notebook supports.
- **Example Idea** is a longer note that uses them together.

## Writing notes

1. Add a `.md` file inside any folder in `Notes/` (or make a new folder).
2. Give it a title with a top-level `# Heading`. That's what shows on the
   index page. Each `## Heading` becomes a link in the note's sidebar.
3. Rebuild the manifest:

   ```bash
   npm run build
   ```

A note's address is its file name: `Notes/Ideas/example-idea.md` is served at
`/example-idea`.

Optional front matter at the top of a note:

```markdown
---
order: 1
hidden: true
---
```

`order` sets the note's position in its folder. `hidden: true` keeps the file
on disk but out of the notebook. A folder named `Ignore` is skipped entirely.
Folder order on the index page is set by `FOLDER_ORDER` in `build-manifest.js`.

## Custom formatting

Beyond standard GitHub-flavored markdown:

```markdown
> [!note] Optional Title
> A callout. Use [!warn] for a warning.

A claim with a citation[^source], shown in the right margin.

[^source]: Author, *Title*. [Read it](https://example.com).

A [hover note]{The text in braces opens in a popover above the underline.}.

--
```

The last line is a half divider, a third of the column wide. See
`Notes/Notes/formatting.md` for the full reference.

## Making it yours

- The name "Notebook" is set in `index.html` and `app.js`.
- Colors, fonts and widths are the variables at the top of `styles.css`.
- To host it, any static host works as long as unknown paths fall back to
  `index.html`, since pages use paths like `/example-idea`.
