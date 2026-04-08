# UI Wrapper Usage

Use only `Ui*` wrappers in pages and feature components.

## Props conventions
- `variant`: `primary | secondary | danger | ghost`
- `size`: `sm | md | lg`
- `disabled`, `loading`, `error` for consistent states

## Examples

```vue
<UiButton variant="primary" size="md">Save</UiButton>
<UiInput v-model="form.name" label="Client" />
<UiBadge tone="success">Active</UiBadge>
```
