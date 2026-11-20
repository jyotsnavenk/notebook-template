---
order: 1
---
# Formatting Reference

Every piece of formatting this notebook can render, shown on one subject:
**Johannes Kepler** (1571–1630), the astronomer who found that the planets move
on ellipses. Each section shows the formatting in use, then the markdown that
wrote it. Open this file next to the page to compare the two.

## Front matter

A note can start with an optional block between two `---` lines. This page's
own front matter is just `order: 1`.

```markdown
---
order: 1
hidden: true
---
# Formatting Reference
```

- `order` sets the note's position within its folder on the index page. Notes
  with no order come after the ordered ones, A to Z by title.
- `hidden: true` keeps the file on disk but leaves it out of the notebook.
- Any other key is ignored.

## Headings

The first `# Heading` is the page title: it sits at the top of the page with a
hatched highlight, and it's the name shown on the index page. Every `##`
heading, like the one above, becomes a link in the left sidebar, which
highlights the section you're reading as you scroll.

### Third level: Tübingen

Kepler was born in Weil der Stadt in 1571 and studied theology at the
University of Tübingen, where his teacher Michael Maestlin quietly taught him
the Sun-centred system of Copernicus.

#### Fourth level: Graz

In 1594 he left for Graz to teach mathematics, and wrote his first book there.

# A later H1 starts a new part

A `#` heading further down a page draws the same hatched title, with extra room
above it. Use it sparingly, to split a long page into parts. It doesn't appear
in the sidebar.

```markdown
# Formatting Reference

## Headings

### Third level: Tübingen

#### Fourth level: Graz

# A later H1 starts a new part
```

## Paragraphs

A paragraph is plain text with a blank line above and below it. Lines that sit
next to each other in the file run together into one paragraph, so you can
wrap the source wherever you like.

In 1600 Kepler moved to Prague to work for Tycho Brahe, who had the best
naked-eye observations of the planets ever made. Tycho died the next year, and
Kepler succeeded him as Imperial Mathematician to Rudolf II.

```markdown
A paragraph is plain text with a blank line above and below it.

In 1600 Kepler moved to Prague to work for Tycho Brahe...
```

## Text styles

Kepler called his book **Astronomia Nova**, the *New Astronomy*, and it was:
***the first book to put physical causes into the heavens***. He bet he could
work out the orbit of Mars in ~~eight days~~; it took him years. The
circle was off by <u>eight minutes of arc</u>, about a quarter of the Moon's
width, and he trusted Tycho's data over the circle. Planet names in code look
like `Mars`, and links look [like this](https://plato.stanford.edu/entries/kepler/).

```markdown
**bold**, *italic*, ***bold italic***, ~~strikethrough~~,
<u>underline</u>, `inline code`, [a link](https://example.com)
```

## Lists

Bullets, with a nested list indented by two spaces:

- *Mysterium Cosmographicum* (1596)
  - Nested the five Platonic solids between the planets' spheres
  - Wrong, but it set the question he spent his life on
- *Astronomia Nova* (1609)
- *Harmonices Mundi* (1619)

Numbered, where a nested numbered list counts a, b, c:

1. **First law:** each planet moves on an ellipse, with the Sun at one focus.
2. **Second law:** the line from the Sun to a planet sweeps equal areas in
   equal times.
   1. A planet moves fastest when it's nearest the Sun
   2. And slowest when it's farthest away
3. **Third law:** the square of a planet's year is proportional to the cube of
   its mean distance from the Sun.

```markdown
- *Mysterium Cosmographicum* (1596)
  - Nested the five Platonic solids between the planets' spheres

1. **First law:** each planet moves on an ellipse...
2. **Second law:** the line from the Sun...
   1. A planet moves fastest when it's nearest the Sun
   2. And slowest when it's farthest away
```

## Quotes

A blockquote is for a line you want to sit with. Kepler wrote his own epitaph:

> I measured the heavens, now I measure the shadows of the earth.

```markdown
> I measured the heavens, now I measure the shadows of the earth.
```

## Callouts

A blockquote whose first line is `[!note]` or `[!warn]` becomes a callout. The
text after it is the title.

> [!note] Kepler's supernova
> In October 1604 a new star appeared in Ophiuchus. Kepler watched it for a
> year, and it is still the last supernova seen in our galaxy with the naked eye.

> [!warn] A trial for witchcraft
> From 1615 to 1621 Kepler's mother, Katharina, was accused of witchcraft. He
> led her defence himself, and she was released.

Leave the title out and the label is the callout's type:

> [!note]
> Kepler's *Somnium*, published after his death, imagines a journey to the
> Moon and is often called one of the first works of science fiction.

```markdown
> [!note] Kepler's supernova
> In October 1604 a new star appeared in Ophiuchus.

> [!warn] A trial for witchcraft
> From 1615 to 1621 Kepler's mother was accused of witchcraft.

> [!note]
> With no title, the label reads "note".
```

## Citations

To cite a source, put `[^label]` right after the words it backs up, and write
the citation on its own line anywhere in the note, starting with `[^label]:`.
The number shows in the text and the citation sits in the right margin beside
it.

Kepler found the third law on 15 May 1618, two months after first noticing
the pattern[^caspar]. His laws came from Tycho's observations, not from the
theory he started with[^voelkel]. Citing the first source again[^caspar] reuses
its number.

```markdown
Kepler found the third law on 15 May 1618[^caspar].

[^caspar]: Max Caspar, *Kepler*, trans. C. Doris Hellman (Dover, 1993).
  A longer citation continues on lines indented by two spaces.
```

- Labels can be anything without spaces (`[^1]`, `[^caspar]`). They're
  numbered 1, 2, 3… in reading order, whatever the labels say.
- The `[^label]:` line starts at the very beginning of a line. Indent the lines
  after it by two spaces to continue it.
- Links in a citation open in a new tab.
- On narrow screens, citations are listed at the end of the note instead.

[^caspar]: Max Caspar, *Kepler*, trans. C. Doris Hellman (Dover, 1993). The
  standard biography, drawn from Kepler's own letters.

[^voelkel]: James R. Voelkel, *Johannes Kepler and the New Astronomy* (Oxford
  University Press, 1999). [Stanford Encyclopedia entry](https://plato.stanford.edu/entries/kepler/).

## Hover notes

Write a hover note like a link: the short text in brackets, then the longer
note in braces right after it. Kepler also wrote about the
[six-sided snowflake]{In *Strena seu de Nive Sexangula* (1611), a New Year's
gift to a friend, he asked why snowflakes always have six points.} and guessed
how spheres pack most tightly. The text gets a dotted underline, and hovering
it opens a popover above it.

The braced part can hold **bold**, *italics*, links, and even a list, for a
[longer note.]{Kepler's work beyond the planets:
- *Astronomiae Pars Optica* (1604): how the eye forms an image
- *Dioptrice* (1611): a telescope with two convex lenses
- *Tabulae Rudolphinae* (1627): planet tables used for a century
}

```markdown
Kepler wrote about the [six-sided snowflake]{The popover text goes in braces.}.

A [longer note.]{Kepler's work beyond the planets:
- *Astronomiae Pars Optica* (1604): how the eye forms an image
- *Dioptrice* (1611): a telescope with two convex lenses
}
```

- While the popover is open, the rest of the page fades behind a white blur.
- It closes as soon as the pointer leaves the underline.
- Longer notes get a wider popover.

## Images

Put images in an `images/` folder next to the note, and write the path from
the project root. The alt text describes the image for screen readers.

![An ellipse with the Sun at one focus. Two shaded sectors cover equal areas: a short, wide one near the Sun where the planet moves fast, and a long, thin one far away where it moves slowly.](Notes/Notes/images/kepler-second-law.svg)

```markdown
![An ellipse with the Sun at one focus...](Notes/Notes/images/kepler-second-law.svg)
```

## Code

Inline code sits in the sentence, like `T² ∝ a³`. Fenced blocks are for
anything longer:

```js
// Kepler's third law: a planet's year from its distance to the Sun.
function orbitalPeriodYears(distanceAU) {
  return Math.sqrt(distanceAU ** 3);
}

orbitalPeriodYears(1.524); // Mars ≈ 1.88 years
```

Code only comes from fences. Text indented by four spaces stays ordinary text:

    Kepler's three laws were published in 1609 and 1619.

````markdown
```js
function orbitalPeriodYears(distanceAU) {
  return Math.sqrt(distanceAU ** 3);
}
```
````

## Tables

The third law, checked against the planets Kepler knew. A colon in the divider
row sets a column's alignment.

| Planet  | Distance (AU) | Year (years) | Distance³ ÷ Year² |
| :------ | ------------: | -----------: | ----------------: |
| Mercury |         0.387 |        0.241 |              1.00 |
| Venus   |         0.723 |        0.615 |              1.00 |
| Earth   |         1.000 |        1.000 |              1.00 |
| Mars    |         1.524 |        1.881 |              1.00 |
| Jupiter |         5.203 |       11.862 |              1.00 |
| Saturn  |         9.537 |       29.457 |              1.00 |

```markdown
| Planet  | Distance (AU) | Year (years) |
| :------ | ------------: | -----------: |
| Mercury |         0.387 |        0.241 |
```

## Dividers

Three dashes on their own line draw a full rule.

---

Two dashes draw a half divider, a third of the column wide, for a lighter
break.

--

```markdown
---

--
```

## Everything at once

| Formatting   | Looks like                         | Written as          |
| ------------ | ---------------------------------- | ------------------- |
| Title        | Hatched heading at the top         | `# Title`           |
| Section      | Ruled heading, linked in sidebar   | `## Section`        |
| Subsections  | Plain headings                     | `###`, `####`       |
| Emphasis     | Bold, italic, strike, underline    | `**` `*` `~~` `<u>` |
| Lists        | Arrows, numbers, a b c             | `-`, `1.`           |
| Quote        | Indented line                      | `> text`            |
| Callout      | Shaded, labelled block             | `> [!note] Title`   |
| Citation     | Number with a note in the margin   | `[^label]`          |
| Hover note   | Dotted underline with a popover    | `[text]{note}`      |
| Image        | Picture in the column              | `![alt](path)`      |
| Code         | Monospace, inline or block         | `` ` `` and ```` ``` ```` |
| Table        | Rows and columns                   | `\| a \| b \|`      |
| Dividers     | Full rule, half rule               | `---`, `--`         |

That's the whole vocabulary.
