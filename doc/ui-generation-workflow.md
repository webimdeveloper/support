# UI Generation Workflow

## Delivery Path

`v0.dev draft -> Cursor refinement -> Ui* wrappers -> ship`

## v0.dev Usage Policy

- v0 output is a draft reference only.
- Do not merge raw generated markup directly into pages.
- Convert generated UI into project wrappers before merge.

## Conversion Checklist

1. Map generated primitives:
   - button -> `UiButton`
   - input/select -> `UiInput` / `UiSelect`
   - table -> `UiTable`
2. Replace hardcoded color/spacing values with design tokens.
3. Normalize props to `variant`, `size`, `loading`, `disabled`.
4. Verify accessibility labels and keyboard behavior.
5. Add or update tests for changed wrapper behavior.

## Selective shadcn Policy

- Use shadcn-style components only when Nuxt UI + wrappers cannot satisfy a required pattern.
- If introduced, expose the feature through a stable `Ui*` wrapper API.
- Feature code must stay implementation-agnostic.
