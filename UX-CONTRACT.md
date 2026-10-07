# VIRaTeC shared component contract

Sources: Jira VIR-18 component audit, its equal-height card rule, and the Figma UI Kit.
This scope covers shared primitives, not authentication, persistence, permissions or CRUD.

| Capability | Canonical owner      | Source of truth                          | Allowed variants                              | Verification                           |
| ---------- | -------------------- | ---------------------------------------- | --------------------------------------------- | -------------------------------------- |
| Form       | shared/ui/Input      | VIR-18 and DESIGN.md                     | default, focus, error, disabled, readonly     | ui-kit.spec.ts label/help/error checks |
| Scrollbar  | app/styles/index.css | DESIGN.md                                | normal and forced colors                      | browser computed style                 |
| Tooltip    | shared/ui/Tooltip    | Figma + Floating UI interaction contract | top, bottom, collision fallback               | focus, hover, Escape, viewport tests   |
| Navigation | shared/ui/NavItem    | Figma + native semantics                 | link or disclosure button                     | keyboard tests                         |
| Action     | shared/ui/Button     | Figma + native semantics                 | primary, secondary, md, lg, disabled, loading | geometry and activation tests          |
| Card       | shared/ui/Card       | VIR-18 row rule                          | optional tag and link                         | equal-height and CTA alignment tests   |

Consumers own form submission/validation timing and dropdown panels. Product forms use noValidate
and supply localized errors. They must not duplicate these primitives or put business logic in them.
Tooltip children forward their ref and DOM events/ARIA props; native disabled controls cannot receive
keyboard focus, so unavailable-action explanations belong in visible helper text.

API changes in this correction:

- NavItem without dropdown now requires href; dropdown=true renders a button and requires onClick.
  Use expanded and aria-controls to reflect the caller-owned panel.
- Tooltip children is one focusable ReactElement, not arbitrary text/fragments or multiple children.
- Button.loading and Input.helperText are optional additions.
  No existing production consumers exist at the pinned PR head.

Run `pnpm --filter @viratec/web test:ui` for component-state, keyboard, geometry, responsive
and automated accessibility coverage. The test-only fixture is at
`/tests/fixtures/ui-kit.html` in the development server and is excluded from the production entry.
