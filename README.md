# InputX Component

`InputX` is a reusable React input component with:

- Controlled and uncontrolled value modes
- Optional clear button and clear-on-escape behavior
- Start/end adornments (including icon support)
- Debounced callbacks for search, filtering, validation, and other workflows
- Legacy auto-search compatibility props for existing integrations

## Files

- `src/InputX.jsx`
- `src/InputXStyles.js`
- `src/index.js`

## Install

```bash
npm install
```

Install as a dependency in another project:

```bash
npm i react-inputx
```

## Run Demo

```bash
npm run dev
```

Optional build/preview commands:

```bash
npm run build:demo
npm run build:lib
npm run preview
```

## Quick Usage

Controlled:

```jsx
import React, { useState } from "react";
import { MdSearch } from "react-icons/md";
import { InputX } from "./src";

export default function Example() {
  const [value, setValue] = useState("");

  return (
    <InputX
      value={value}
      onValueChange={setValue}
      placeholder="Search members..."
      Icon={MdSearch}
      onDebouncedChange={nextValue => {
        // fetch or filter with nextValue
      }}
      debounceMs={500}
    />
  );
}
```

Uncontrolled:

```jsx
<InputX
  defaultValue="Initial value"
  placeholder="Type here"
  clearOnEscape
  endAdornment={<small>Optional</small>}
/>
```

## Full API Reference

### Value and change props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `undefined` | Controlled input value. |
| `defaultValue` | `string` | `""` | Initial value for uncontrolled mode. |
| `onValueChange` | `(value, event?) => void` | `undefined` | Preferred value callback. Called whenever the input value changes (including clears). |
| `onChange` | `(event) => void` | `undefined` | Native input `onChange` callback. |
| `setValue` | `(value) => void` | `undefined` | Legacy value setter support. |

### Debounce and search props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `onDebouncedChange` | `(value) => void` | `undefined` | Generic debounced callback. |
| `debounceMs` | `number` | `1000` | Debounce delay in ms for `onDebouncedChange`. |
| `autoSearch` | `boolean` | `false` | Legacy behavior: triggers `reloadList` after debounce. |
| `autoSearchDelay` | `number` | `undefined` | Legacy debounce override. If set, it takes precedence over `debounceMs`. |
| `reloadList` | `() => void` | `undefined` | Legacy reload callback used by `autoSearch` and empty-value transitions. |
| `listQueries` | `Array<{ cancel?: () => void }>` | `undefined` | Legacy query handles. When value becomes empty, each cancel function is called if present. |

### Input behavior and native attributes

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `"inputX"` | Input id attribute. |
| `name` | `string` | `undefined` | Input name attribute. |
| `placeholder` | `string` | `"Enter text..."` | Input placeholder text. |
| `type` | `string` | `"text"` | Input type. |
| `disabled` | `boolean` | `false` | Disables input and clear button. |
| `readOnly` | `boolean` | `false` | Makes input read-only and disables clear button. |
| `required` | `boolean` | `false` | Native required attribute. |
| `autoComplete` | `string` | `undefined` | Native autocomplete attribute. |
| `autoFocus` | `boolean` | `false` | Native autofocus attribute. |
| `inputMode` | `string` | `undefined` | Native input mode hint. |
| `maxLength` | `number` | `undefined` | Native max length. |
| `minLength` | `number` | `undefined` | Native min length. |
| `pattern` | `string` | `undefined` | Native regex pattern. |

### Clear behavior props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `clearable` | `boolean` | `true` | Shows clear button when value is non-empty and input is interactive. |
| `clearOnEscape` | `boolean` | `false` | Press Escape to clear value when interactive and non-empty. |
| `onClear` | `() => void` | `undefined` | Called after a clear action. |
| `clearButtonAriaLabel` | `string` | `"Clear input"` | Accessibility label for the clear button. |

### Adornment and icon props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `Icon` | `React component type \| React node` | `false` | Legacy leading icon support. If a component type is passed, `iconSize` is applied. |
| `iconSize` | `string` | `"1.4rem"` | Size used when `Icon` is a component type. |
| `startAdornment` | `React node` | `undefined` | Preferred leading adornment. Takes precedence over `Icon`. |
| `endAdornment` | `React node` | `undefined` | Trailing adornment rendered near the right side. |

### Styling props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `""` | Class for outer container element. |
| `inputClassName` | `string` | `""` | Class for input element. |
| `containerStyle` | `React.CSSProperties` | `undefined` | Inline style override for container. |
| `inputStyle` | `React.CSSProperties` | `undefined` | Inline style override for input. |
| `iconStyle` | `React.CSSProperties` | `undefined` | Inline style override for start adornment wrapper. |
| `clearButtonStyle` | `React.CSSProperties` | `undefined` | Inline style override for clear button icon. |

### Other props

- Any additional props are passed through to the native `<input />` via `...rest`.
- `InputX` uses `forwardRef`, so refs point to the native input element.

## Behavior Notes

- Controlled vs uncontrolled:
  - Use `value` with `onValueChange` for controlled mode.
  - Use `defaultValue` without `value` for uncontrolled mode.
- Avoid wiring both `setValue` and `onValueChange` unless you explicitly want both callbacks to run.
- Debounced behavior:
  - Debounce runs when `onDebouncedChange` is provided, or when `autoSearch` and `reloadList` are enabled.
  - `autoSearchDelay` overrides `debounceMs` when both are set.
- Empty-value legacy reload behavior:
  - When value transitions to empty (or starts empty on first mount), legacy cancellation and reload paths may run.
  - Clear-button clears intentionally suppress the immediate empty-transition reload to avoid duplicate reload calls.

## Accessibility Notes

- Clear button is keyboard-activatable (`Enter` and `Space`).
- Use `clearButtonAriaLabel` to customize assistive text.

## Legacy Compatibility and Migration

Still supported legacy props:

- `autoSearch`
- `autoSearchDelay`
- `reloadList`
- `listQueries`
- `setValue`
- `Icon`

Recommended modern usage:

- Prefer `onValueChange` over `setValue`
- Prefer `onDebouncedChange` + `debounceMs` over `autoSearch` + `reloadList`
- Prefer `startAdornment` over `Icon`

## Notes

- `InputX` has default internal styles and no longer depends on Bootstrap or external CSS variables.

## Publishing Checklist

1. Confirm package contents:

```bash
npm run build:lib
npm run check:package
```

2. Bump version before each release:

```bash
npm version patch
```

3. Authenticate and publish:

```bash
npm login
npm publish
```

4. Verify package on npm and test install:

```bash
npm i react-inputx
```

Recommended before first publish:

- Add repository metadata (`repository`, `homepage`, and `bugs`) in `package.json`.
