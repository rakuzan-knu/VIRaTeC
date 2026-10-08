---
version: alpha
name: VIRaTeC UI Kit
description: A dark navy research community interface with lime actions and cyan research links.
colors:
  background: '#03122e'
  surface: '#061a39'
  primary: '#b5fa67'
  primaryText: '#101721'
  limeText: '#b7f96c'
  cyan: '#03c5ea'
  foreground: '#ffffff'
  muted: '#b8becf'
  subtle: '#8b97a6'
  error: '#ff6b6b'
typography:
  sans:
    fontFamily: 'DM Sans, Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '16px'
    lineHeight: '24px'
  cardTitle:
    fontFamily: 'DM Sans, Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '22px'
    lineHeight: '29px'
rounded:
  control: '14px'
  controlLarge: '18px'
  card: '22px'
  tooltip: '10px'
spacing:
  cardPadding: '28px'
  cardGap: '14px'
  largeButtonInline: '26px'
  largeButtonBlock: '16px'
components:
  button: {}
  card: {}
  input: {}
  navItem: {}
  tag: {}
  tooltip: {}
---

# VIRaTeC UI Kit

## Overview

The source is [Figma UI Kit](https://www.figma.com/design/QafTp1b3yAF8bTfjBc6xlY/ViraTec?node-id=200-2)
and the component audit and equal-height rule in Jira VIR-18. Values were inspected in the
authenticated Figma viewer on 2026-10-07, including the Home (v2) sibling frame.

The audience is university researchers, students, and international collaborators. The signature
is lime calls to action on deep navy, with cyan research links. Quiet cards support reading.
This is a shared kit for a research website; it introduces no application domain workflows.
Consumers supply localized labels and errors; components contain no business logic.

Runtime ownership is **Model B**: the hand-maintained Tailwind v4 theme in
`apps/web/src/app/styles/index.css` is canonical; this file documents its accepted values.
The existing unused bg-panel token has not been reinterpreted from an unrelated frame.
No generated theme adapter is introduced.

## Colors

Page navy comes from Home (v2)'s #03122E background. Kit surface is #061A39.
Cards and fields use white at 5% and 6% opacity; default and strong borders use white at 12%
and 35%. Lime/Cyan tags use their respective accents at 14% opacity.
Cyan indicates links and focus; red errors also have visible text and invalid semantics.
Tooltip text is #101721 on white. Forced-colors mode retains system-operated scrollbars.

## Typography

DM Sans 400/500/600/700 is self-hosted through `@fontsource/dm-sans`; no Google Fonts request
is needed at runtime. DM Sans covers Latin; self-hosted Inter Cyrillic subsets provide a deliberate Ukrainian fallback.
Card titles: 22/29 px, weight 500. Descriptions: 16/24 px, weight 400.
Large buttons: 18/26 px; medium: 16/23 px, weight 500.
Labels/tooltips: 14/18 px. Tags/helper errors: 12/16 px; tags track at 0.08em.
Input and navigation text: 16/21 px. Navigation uses regular weight.

## Layout

Large primary buttons use 26px inline and 16px block padding with 14px gap (58px high).
Medium primary buttons use 20px inline and 12px block padding with 10px gap (47px high).
Secondary buttons add a 1.5px border. Cards use 28px padding and 14px gaps.
Each card fills its grid cell; its CTA is pushed to the bottom. Text wraps without silently
truncating titles or identifiers. Nav targets have at least 24px height for accessibility,
a deliberate enlargement of the 21px visual label box.

## Elevation & Depth

Tonal surfaces and thin borders convey hierarchy; do not add decorative shadows.
Tooltip is portalled with a dedicated z-index token and collision padding. Scrolling remains
owned by the document; this kit does not impose viewport-height constraints on pages.

## Shapes

Controls have 14px corners, large buttons 18px, cards 22px and tooltips 10px.
Tags are pills. Native semantics and visible outlines take priority over ornamental motion.

## Components

Button exposes primary/secondary and md/lg, optional arrow, disabled and loading.
Loading retains geometry and the accessible label, exposes busy state and blocks activation.
Input combines consumer descriptions, helper text and error text; the label activates the input.
Navigation routes require href; dropdown disclosure uses a button, an explicit expanded prop,
and a caller-owned action/panel. The arrow tracks expansion independently from current route.
Tags expose lime/cyan. Cards optionally expose a real link.
Tooltip accepts one focusable React 19 child that forwards DOM props/ref; it preserves the
child's handlers/ref and descriptions, opens on hover/focus, permits hovering its content,
and dismisses on Escape, blur, outside press or trigger activation. Essential information must
also exist in visible content; tooltips are supplementary and contain no interactive elements.
For disabled actions, show the reason in ordinary helper text.

`cn()` in shared/lib combines clsx and tailwind-merge, including custom typography/border
utilities. All component presentation uses Tailwind utilities and theme tokens; Floating UI
owns only the runtime coordinates needed for anchored overlay positioning.
Feedback transitions respect reduced motion. State examples and browser checks live in
`apps/web/tests`; the fixture is development-only and is not a production route.

## Do's and Don'ts

- Reuse the six public component APIs in shared/ui and supply translated content from consumers.
- Keep equal-height cards and aligned CTAs per row; permit natural single-column mobile flow.
- Preserve the navy/lime/cyan identity from Figma rather than introducing a new visual theme.
- Do not render placeholder links, non-semantic actions, color-only errors or hover-only essential content.
