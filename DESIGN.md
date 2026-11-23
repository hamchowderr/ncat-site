---
name: Takewon site
description: Marketing site for Takewon, in the familiar clean look of clipping platforms.
colors:
  ink: "#0b0b12"
  soft-ink: "#4f5260"
  mute: "#6b6e7c"
  paper: "#ffffff"
  panel: "#f4f4f7"
  panel-deep: "#ebebf0"
  hairline: "#e2e2e9"
  primary: "#5b3df5"
  primary-hover: "#4a2ee0"
  primary-soft: "#efecff"
  primary-ink: "#3d24c4"
  error: "#b42318"
  error-soft: "#fdecea"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2.8vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
rounded:
  md: "14px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  gutter: "16px"
  page-side: "24px"
  max-width: "1200px"
  section: "clamp(80px, 10vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "40px"
  button-ghost:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.panel-deep}"
  ask-bar:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.pill}"
    padding: "6px"
    width: "640px"
  segmented-tabs:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.pill}"
    padding: "4px"
  choice-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "42px"
  choice-pill-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
  screen-panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.xl}"
---

# Design System: Takewon site

## Overview

**Creative North Star: "The Category Standard"**

The site deliberately looks like the clipping platforms its buyers already know: a white page, one violet accent, a centred sentence-case headline, an ask bar with example chips, and a large stage showing the real product. Familiarity is the point. A creator or agency should recognise the category in one glance, then notice the difference in the words: pay once, own it, it runs by itself.

Everything sits on white or on soft grey panels. Groups are made with space and tone, never with heavy outlines. The product does the visual work: real screen recordings in the hero and real dashboard screens through the page, each set on a soft grey panel like a photo on a mat. Motion is small and purposeful: one rotating word in the headline, tabs that swap recordings, and nothing that moves for people who turn motion off.

**Key Characteristics:**
- White ground, one violet accent, soft grey panels
- Pill shapes for every control: buttons, ask bar, tabs, chips, form choices
- Real product media on grey mats, with a soft lifted shadow on the screen itself
- Archivo display with tight tracking over Geist body
- Space and tone for grouping, hairlines only on chips and unselected pills

## Colors

A near-monochrome palette of ink and cool greys, with one saturated violet carrying every action and every "this is ours" moment.

### Primary
- **Signal Violet** (primary): primary buttons, the rotating headline word, selected tabs and form choices, focus rings, text selection, the brand mark.
- **Pressed Violet** (primary-hover): hover state of primary buttons only.
- **Violet Wash** (primary-soft): the one highlighted panel per screen, such as the self-hosted plan or the Takewon side of a comparison; chip hover.
- **Deep Violet Ink** (primary-ink): violet text on Violet Wash, where full violet would be too loud.

### Neutral
- **Night Ink** (ink): headings, body text, the dark header button.
- **Soft Ink** (soft-ink): lede and supporting paragraphs.
- **Mute** (mute): captions, placeholders, optional-field labels, legal lines.
- **Paper** (paper): the page.
- **Mat Grey** (panel): panels behind screenshots and videos, ghost buttons, the ask bar, tab tracks.
- **Deep Mat** (panel-deep): hover for ghost buttons and grey surfaces.
- **Hairline** (hairline): inset rings on chips and unselected pills; table rules.
- **Error Red / Error Wash** (error, error-soft): form errors only.

### Named Rules
**The One Voice Rule.** Violet is the only hue. It marks actions and the product's own side of any comparison; it never decorates.

**The One Wash Rule.** At most one Violet Wash panel per view, so the highlighted choice stays obvious.

## Typography

**Display Font:** Archivo (with system sans fallback)
**Body Font:** Geist (with system sans fallback)
**Label/Mono Font:** JetBrains Mono, for file names and small technical values only

**Character:** Archivo at 700 with tight negative tracking gives the confident, compact headline voice of the category; Geist keeps body copy calm and readable.

### Hierarchy
- **Display** (700, clamp 2.4rem to 4.6rem, 1.04): the home hero headline only, max 21ch, centred. The pricing hero uses the same role at up to 4.5rem.
- **Headline** (700, clamp 2rem to 3.25rem, 1.08): section headings, centred over a lede.
- **Title** (700, clamp 1.6rem to 2.25rem, 1.08): feature row titles and card headings.
- **Body** (400, 17px, 1.55): paragraphs, max about 52 to 62ch; ledes step up to 19 to 20px in Soft Ink.
- **Label** (600, 15px): form questions, tab labels, button text (16px on full-size buttons).

### Named Rules
**The Sentence Case Rule.** Every heading is sentence case. No kickers or eyebrow labels above headings.

## Layout

A centred column with a 1200px content width, 24px side padding on desktop and a 16px gutter on phones (safe-area aware). Sections are separated by generous vertical space (about 80 to 140px, scaled with the viewport), not by rules or background bands. The hero is centred; feature rows alternate text and screen in a 5:7 split and stack below 900px. The hero stage is wider than the text column (up to 1248px) and must start inside the first viewport on desktop. On phones the ask bar stacks into a rounded box with a full-width button, chips scroll sideways inside their own row, and nothing scrolls the page sideways.

## Elevation & Depth

Mostly flat and tonal. Depth comes from grey mats under white screens. Shadows are reserved for three things: the product screen inside a mat, the primary button's violet glow, and the white selected tab in a grey track.

### Shadow Vocabulary
- **Screen lift** (`0 2px 4px rgb(11 11 18 / 0.04), 0 24px 60px -20px rgb(41 24 140 / 0.28)`): the video or screenshot sitting on its mat.
- **Soft card** (`0 1px 2px rgb(11 11 18 / 0.04), 0 8px 24px -8px rgb(11 11 18 / 0.12)`): the focused ask bar and small raised surfaces.
- **Violet glow** (`0 6px 18px -6px rgb(91 61 245 / 0.55)`): primary buttons only.

### Named Rules
**The No Heavy Lines Rule.** Group with space and soft tones. Outlines are at most a 1px inset Hairline on small controls; containers never get borders.

## Shapes

Pills for every interactive control (999px). Panels and mats use a large soft radius (24px); the screens inside them a slightly smaller one (14px) so they nest. Cards and the stacked phone ask bar use 16px. The rotating headline word is a violet rounded tag (0.28em radius) set inline with the text.

## Components

### Buttons
- **Shape:** full pill (999px), 48px tall, 40px for the small header size.
- **Primary:** Signal Violet with white text and the violet glow; hover goes to Pressed Violet.
- **Dark:** Night Ink with white text, used once, in the header.
- **Ghost:** Mat Grey with ink text; hover Deep Mat. On grey panels a ghost button turns white so it stays visible.
- **Press:** moves down 1px.

### Chips
- **Style:** transparent with a 1px Hairline inset ring, Soft Ink 14px text.
- **Hover:** Violet Wash with Deep Violet Ink, ring removed. Clicking one fills the ask bar.

### Cards / Containers
- **Corner Style:** 24px for mats and plan cards, 16px for small cards.
- **Background:** Mat Grey; the one highlighted card uses Violet Wash.
- **Shadow Strategy:** none on containers; see Elevation.
- **Border:** none.
- **Internal Padding:** scales from about 10px on phones to 22 to 28px on desktop for mats.

### Inputs / Fields
- **Ask bar:** a Mat Grey pill holding a borderless input and a primary button. On focus it turns white with a 2px violet ring and the soft card shadow.
- **Form choices:** white pills with a Hairline inset ring; selected turns Signal Violet with white text; keyboard focus shows a 2px violet outline offset 2px.
- **Error:** Error Red message under the question, pills get a light red ring.

### Navigation
- **Header:** brand mark plus name on the left, four text links, a small dark "Get early access" pill. Below 860px the links fold into a menu button that opens a full-width list under the header, never over content.
- **Segmented tabs:** a Mat Grey pill track; the selected tab is a white pill with a faint shadow. Used for the hero stage and use cases; arrow keys move between tabs.

### Hero stage (signature)
Four tabs over a grey mat holding a real, muted recording of the dashboard. A recording plays once, then the next tab takes over. A caption below says what the clip shows. With reduced motion the video is paused and shows controls.

## Do's and Don'ts

### Do:
- **Do** show the real product: recordings and screenshots of the working dashboard, with demo data said plainly.
- **Do** use the real logo of every company or platform named.
- **Do** keep violet for actions and for the product's own side of a comparison.
- **Do** put product media on Mat Grey with the screen lift shadow.
- **Do** keep every control a pill.

### Don't:
- **Don't** draw borders around containers or use heavy box outlines.
- **Don't** let anything overlay content: no floating bars or sticky overlays over text.
- **Don't** add kickers or eyebrow labels above headings.
- **Don't** use sparkle or star icons for AI.
- **Don't** add a second accent hue or a dark mode.
