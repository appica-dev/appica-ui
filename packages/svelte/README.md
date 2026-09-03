# @appica/ui-svelte

A Svelte 5 component library sharing design tokens with [`@appica/ui-react`](https://www.npmjs.com/package/@appica/ui-react). Wave 1 covers presentational primitives; see [COMPONENT-STATUS.md](./COMPONENT-STATUS.md) for the full checklist.

**[Documentation](https://appica.dev/ui)**

## Prerequisites

| Dependency   | Version   |
| ------------ | --------- |
| Svelte       | `>= 5.33` |
| Tailwind CSS | `>= 4.0`  |

## Installation

```bash
pnpm add @appica/ui-svelte
```

## Configure Tailwind

```css
@import 'tailwindcss';
@import '@appica/ui-svelte/styles.css';

@source '../node_modules/@appica/ui-svelte/dist';
```

`@source` takes a path relative to the stylesheet that contains it. Tailwind ignores `node_modules` by default, so without it the component classes will not generate.

## Add the provider

```svelte
<script lang="ts">
  import { ThemeProvider } from '@appica/ui-svelte'
</script>

<ThemeProvider>
  <!-- app -->
</ThemeProvider>
```

## License

MIT
