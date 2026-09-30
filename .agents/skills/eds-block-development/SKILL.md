---
name: eds-block-development
description: Build or change AEM Edge Delivery Services blocks and Universal Editor models in this repository. Use for author-facing block structure, decoration, or styling; skip for documentation-only work and read-only migration analysis.
---

# EDS block development

Commands and hard rules are in the repository's `AGENTS.md`.

## Conventions
- JS: ES6+, Airbnb ESLint, always `.js` in imports, LF line endings.
- Handle missing or extra author fields gracefully; use `moveInstrumentation()` when
  replacing authored nodes with new elements.
- CSS: scope every selector to the block (`.{block} .item`), mobile first with
  `min-width` breakpoints at 600/900/1200px. Never use `{block}-container` or
  `{block}-wrapper` classes (reserved for sections).
- Semantic HTML, correct heading hierarchy, alt text, WCAG 2.1 AA.

## Steps
1. Inspect the current block, its partial model, section filters, and representative authored markup before deciding what to change. For migration work, inspect the matching legacy component as read-only reference.
2. Define the author-facing content structure and observable behavior. Prefer an existing block pattern where it fits; keep optional or missing fields safe. If the structure changes, account for existing content. For known UE and model pitfalls, consult the relevant section of `docs/knowledge/eds-ue-lessons.md`. For definitions, models, filters and field types, use the `ue-component-model` skill; for designing the content model, use the `content-modeling` skill.
3. Implement the smallest block or model change that satisfies the request. Keep decoration in `blocks/<name>/<name>.js`, block styles in `blocks/<name>/<name>.css`, and Universal Editor definitions in the relevant partial JSON file.
4. After changing partial models or filters, run `npm run build:json`. Run `npm run lint` for code or model changes.
5. Validate against representative content. Use the local AEM server and a browser when the change affects rendered or interactive behavior; check mobile and desktop layouts and authoring behavior when relevant. For Universal Editor and preview testing (URLs, `?ref=<branch>`, publish to Preview only), follow `FLOW.md`. Report any validation that could not be performed.
