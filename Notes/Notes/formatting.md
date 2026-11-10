---
order: 1
---
# Formatting Reference

A tour of everything this notebook can render. Open this file next to the page
to see how each piece is written.

## Front matter

Every note can start with an optional block between two `---` lines.

```markdown
---
order: 1
hidden: true
---
# The page title
```

- `order` sets the note's position within its folder on the index page. Notes
  with no order come after the ordered ones, A to Z.
- `hidden: true` keeps the file on disk but leaves it out of the notebook.
- The first `# Heading` is the page title. It shows on the index page.

## Headings

Use `#` through `####`. Every `##` heading becomes a link in the left sidebar,
and the sidebar highlights the section you are reading as you scroll.

### Third-level heading

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

#### Fourth-level heading

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Text

You can write **bold**, *italic*, ~~strikethrough~~ and `inline code`. Links
look [like this](https://example.com).

## Lists

- First item
- Second item
  - A nested point
  - Another one
- Third item

And ordered:

1. Open the folder
2. Add a note
3. Rebuild the manifest

## Quotes

Blockquotes are good for a line you want to sit with.

> The palest ink is better than the best memory.

## Callouts

A little extra syntax beyond standard markdown. Write a blockquote whose first
line is `[!note]` or `[!warn]`, followed by an optional title:

> [!note] Note
> Callouts are good for asides, tips, and definitions that shouldn't
> interrupt the main thread of a page.

> [!warn] Heads up
> Remember to run `node build-manifest.js` after adding or renaming files,
> or new notes won't show up on the index page.

```markdown
> [!note] Note
> Callouts are good for asides, tips, and definitions.

> [!warn] Heads up
> A warning-styled callout.
```

## Citations

To cite a source, put `[^label]` right after the words it backs up, and
write the citation on its own line anywhere in the note, starting with
`[^label]:`. The number shows in the text and the citation sits in the right
margin beside it[^source]. On narrow screens, citations are listed at the end
of the note instead. A second citation[^second] gets the next number, and
citing the first one again[^source] reuses its number.

```markdown
The number shows in the text and the citation sits in the margin[^source].

[^source]: Author Name, *Title of the Work*, 2026.
  [Read it here](https://example.com).
```

- Labels can be anything without spaces (`[^1]`, `[^source]`). They're
  numbered 1, 2, 3… in reading order.
- The `[^label]:` line starts at the very beginning of a line. Indent the lines
  after it by two spaces to continue it.

[^source]: Author Name, *Title of the Work*, 2026. Lorem ipsum dolor sit amet,
  consectetur adipiscing elit. [Read it here](https://example.com).

[^second]: A second source, to show how citations stack in the margin.

## Hover notes

For a short note with more behind it, write it like a link: the short note in
brackets, then the [larger context]{This is the popover. It opens right above
the underline, and can hold **bold**, *italics* and
[links](https://example.com).} in braces right after it. The short note gets a
dotted underline, and hovering it opens a popover with the rest.

```markdown
Lorem ipsum [dolor sit amet]{The popover text goes in braces.}.
```

The braced part can also hold a list, for a
[longer hover note.]{A hover note with several lines:
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore
- Ut enim ad minim veniam, quis nostrud exercitation
}

- While the popover is open, the rest of the page fades behind a white blur.
- The popover closes as soon as the pointer leaves the underline.
- Longer notes get a wider popover.

## Images

Put images in an `images/` folder next to the note, and write the path from
the site root.

![Write, a markdown file in a folder, leads to Build, which scans folders and writes the manifest, which leads to Read, the rendered page with a section sidebar](Notes/Notes/images/write-build-read.svg)

```markdown
![A description of the image](Notes/Notes/images/write-build-read.svg)
```

## Code

Inline `const x = 1` and fenced blocks:

```js
function greet(name) {
  return `Hello, ${name}`;
}
```

Code only comes from fences. Indented text is never turned into a code block.

## Tables

| Element   | Looks like            | Written as        |
| --------- | --------------------- | ----------------- |
| Citation  | A number in the text  | `[^label]`        |
| Hover     | A dotted underline    | `[text]{popover}` |
| Callout   | A shaded block        | `> [!note] Title` |

## Dividers

Use three dashes for a horizontal rule.

---

Use two dashes for a half divider, a third of the column wide.

--

That's the whole vocabulary.
