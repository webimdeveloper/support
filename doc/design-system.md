# Design System Guide

## Principles

- Use `@nuxt/ui` as the base ecosystem.
- Consume base UI only through `Ui*` wrappers in `components/ui`.
- Keep feature modules focused on behavior, not visual primitive details.
- Use semantic variants and tokens instead of ad-hoc utility stacks.

## Folder Structure

- `components/ui`: base wrappers (`UiButton`, `UiInput`, ...)
- `components/composed`: reusable multi-part UI blocks
- `components/features`: domain-specific components
- `assets/css/main.css`: semantic design tokens
- `app.config.ts`: Nuxt UI defaults and theme mapping

## Component Rules

- Wrapper props:
  - `variant`: `primary | secondary | danger | ghost`
  - `size`: `sm | md | lg`
  - state props: `disabled`, `loading`, `error`
- Event conventions:
  - value updates: `update:modelValue`
  - action events: `click`, `submit`, `close`
- Accessibility:
  - Inputs must have labels or `aria-label`
  - Buttons must define `type`
  - Interactive elements must keep focus states
