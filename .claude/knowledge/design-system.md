# Design system — applying it in code

Design system values are not duplicated here. Sources of truth:

| What                                                                   | Where                                                 |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| Colors, typography, geometry, components, site rules, do's and don'ts  | [`DESIGN.md`](../../DESIGN.md) at the repository root |
| Shared component contract: owner, allowed variants, how it is verified | [`UX-CONTRACT.md`](../../UX-CONTRACT.md)              |
| Working Tailwind v4 tokens                                             | `@theme` in `apps/web/src/app/styles/index.css`       |

Ownership follows "Model B" from `DESIGN.md`: the hand-maintained `@theme` in `index.css` is canonical, `DESIGN.md` documents the accepted values. When you change a token, change both places. There are no generated theme adapters — do not add any.

## Non-negotiable rules

- **Tokens only.** A color in a component is a token utility (`bg-bg-card`, `text-text-muted`, `border-border-default`, `text-brand-cyan`, `bg-viratec-deep`, etc.). White with opacity from `DESIGN.md` (`bg-white/5`, `border-white/10`) is also allowed. A raw hex or `rgba` in a class (`text-[#b8becf]`) is a violation: if a design-system value has no token, add one to `@theme` first. Shadows and gradients follow the same rule: shadows are `--shadow-*` tokens, gradients are named `@utility` classes in `index.css`. Tailwind arbitrary values are allowed only for geometry and typography that have no token. Exception — `shared/config/brand.ts`: `build-tools/generate-brand-assets.ts` uses it in Node to generate icons and OG images where CSS variables are unavailable; keep its values equal to the tokens.
- **Color roles.** Lime is the primary action and key figures. Cyan is links, interactive text and focus. An error is `state-error` plus visible text and `aria-invalid`, never color alone.
- **No decorative shadows or gradients.** Hierarchy comes from tonal surfaces and thin borders. Card hover changes only the border and fill.
- **Typography.** Headings use `font-display` (Instrument Sans 500, negative tracking), body text uses DM Sans; the Cyrillic fallback is self-hosted Inter. Fonts are self-hosted via `@fontsource`, there are no requests to Google Fonts. Uppercase with tracking only in the `Tag` kit component.
- **Cards in a row have equal height**, the CTA is pinned to the bottom. Text wraps; titles and identifiers are never silently truncated.
- **Motion** respects `prefers-reduced-motion`. One orchestrated hero animation on the home page, no per-section reveal animations.
- **Accessibility.** Native semantics, visible focus (including in forced-colors mode), navigation targets at least 24px, a tooltip carries only supplementary information with no interactive elements, the reason an action is unavailable goes in visible helper text.

## Shared components

The six kit components from `UX-CONTRACT.md` — `Button`, `Card`, `Input`, `NavItem`, `Tag`, `Tooltip` — live in `apps/web/src/shared/ui/<Name>/` (a folder with `index.ts`, the component and `*.types.ts`). Their values are verified against Figma and locked in by tests — do not change their geometry or API without a task. `Select` and `Textarea` use the same layout but are not part of `UX-CONTRACT.md` or the spec. Other site primitives (`link-button`, `section-header`, `info-card`, `cta-section`, `dialog`, …) are kebab-case files in `shared/ui`.

- Do not duplicate primitives: before building a button, field or card, look for a ready component in `shared/ui`.
- Kit components contain no business logic and no copy: localized labels and errors are passed in by the consumer.
- Classes are merged with `cn()` from `@/shared/lib` (clsx + tailwind-merge with custom utilities).
- Floating UI only computes overlay coordinates; all presentation is Tailwind.
