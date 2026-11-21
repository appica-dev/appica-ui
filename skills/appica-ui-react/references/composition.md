# Composition

How to make a component render as something else, make a link look like a button, and reach the elements
around a popup. Full text: `https://appica.dev/ui/docs/react/composition.md`.

## Contents

- [The render prop](#the-render-prop)
- [A link that looks like a button](#a-link-that-looks-like-a-button)
- [Where className goes](#where-classname-goes)
- [Server Components](#server-components)
- [The elements around a popup](#the-elements-around-a-popup)
- [The container prop](#the-container-prop)
- [Types](#types)

## The render prop

Most components take `render`. Pass an element and the component adopts it as its output, merging in its own
props, classes and handlers. It changes the element and keeps the component's role.

```tsx
<NavigationLink render={<Link href="/pricing" />}>Pricing</NavigationLink>
<Badge render={<a href="/tags/react" />}>React</Badge>
<TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
```

A trigger (`DialogTrigger`, `DropdownMenuTrigger`, `PopoverTrigger`, `TooltipTrigger`) renders its own
`<button>`. To make a `Button` the trigger, pass it through `render` as above. Nesting it as a child puts a
button inside a button.

A menu item that navigates is a `*LinkItem` (`DropdownMenuLinkItem`, `ContextMenuLinkItem`,
`MenubarLinkItem`) with the router link in `render`. A link item does not close the menu when clicked, which
shows with client-side routing: the page changes and the menu stays open. Pass `closeOnClick`.

```tsx
<DropdownMenuLinkItem closeOnClick render={<Link href="/settings" />}>
  Settings
</DropdownMenuLinkItem>
```

## A link that looks like a button

`Button` enforces button semantics, so `<Button render={<a />}>` produces a link that assistive technology
announces as a button. Leave the link a link and give it the button's classes:

```tsx
import { buttonVariants } from '@appica/ui-react/button'

<Link href="/pricing" className={buttonVariants({ variant: 'outline', size: 'md' })}>
  View pricing
</Link>
```

| Helper | Import from | Takes |
| --- | --- | --- |
| `buttonVariants` | `@appica/ui-react/button` | `variant`, `size` |
| `inputVariants` | `@appica/ui-react/input` | `variant`, `size`, `state` |
| `navigationLinkVariants` | `@appica/ui-react/navigation` | `variant`, `size` |

`nativeButton={false}` with `render` is for drawing a Button on a non-interactive element, a `<div>` or a
`<span>`. It is not a way to render a link.

## Where className goes

On a component composed with `render`:

- **Visual overrides** (`className`, `style`) go on the **wrapper**.
- **Structural props** (`href`, `type`, `variant`, `size`) go on the element inside `render`.

```tsx
// Right: the class is on the wrapper
<TooltipTrigger className="rounded-full" render={<Button variant="ghost">Help</Button>} />

// Wrong: the class is on the element passed to render
<TooltipTrigger render={<Button variant="ghost" className="rounded-full">Help</Button>} />
```

In a Server Component the inner element is built on the server, serialized, then cloned on the client, and
the 2 class strings can disagree: a hydration mismatch. The wrapper's classes are merged last, so they still
win. If a class has to sit on the inner element, extract the trigger into a `'use client'` component of its
own.

Any `className` is merged with tailwind-merge: a conflicting utility replaces the component's, with no
`!important` and no specificity to fight.

```tsx
<Button className="w-full rounded-full">Continue</Button>
```

Prefer a `variant` to recoloring. Buttons, badges and menu items paint their hover and pressed fill on a
`::before` layer, so a recolor has to target it too: `hover:before:bg-background-muted`, not `hover:bg-*`.

## Server Components

Interactive components carry their own `'use client'` boundary, so they import straight into a Server
Component:

```tsx
import { Button } from '@appica/ui-react/button'

export default function Page() {
  return <Button>Works in a Server Component</Button>
}
```

What cannot cross the boundary is a non-serializable prop: a function such as `onClick`, a function child, or
`render={<YourClientComponent />}`. Move that piece into a small `'use client'` component of your own and keep
the page a Server Component. Providers are client components too, and sit fine inside the root layout's
`<body>`.

## The elements around a popup

A popup is more than the box you see. Floating components render a portal, a positioner and the popup. Modal
components render a portal, a backdrop, a viewport and the popup. `*Content` is the popup, so its
`className`, `style` and `render` land there. The rest are reached through props on `*Content`:

| Prop | Reaches | On |
| --- | --- | --- |
| `positionerProps` | the element that positions the popup | floating components |
| `portalProps` | the portal | floating and modal components |
| `backdropProps` | the dimmed layer behind a modal | Dialog, AlertDialog, Drawer |
| `viewportProps` | the fixed layer that centers the popup | Dialog, AlertDialog, Drawer |

```tsx
<PopoverContent positionerProps={{ className: 'z-100' }}>...</PopoverContent>
<DialogContent backdropProps={{ className: 'bg-black/60' }}>...</DialogContent>
```

A `className` passed this way is merged with the component's own. Positioning needs none of this: `side`,
`align`, `sideOffset`, `alignOffset`, `anchor` and the collision props are flat props on `*Content`.

Because the popup is portaled to `<body>`, nothing set on an ancestor of the trigger reaches it through CSS.
A `dark` class goes on the positioner or the viewport (see [theming.md](theming.md)), and so does a `dir` for a
right-to-left region (see [accessibility-and-rtl.md](accessibility-and-rtl.md)). React context is not affected:
it crosses a portal.

## The container prop

`container` moves the portal: it takes an element, a `ShadowRoot`, or a ref to either. Use it for shadow DOM,
an iframe, or a stacking context you own on purpose.

Do not use it to theme a popup or to "keep it inside" a panel. The panel's `overflow: hidden` clips the popup
again, and `z-50` competes inside the panel's stacking context. For Dialog, AlertDialog and Drawer it is worse:
their backdrop and viewport are `position: fixed`, and any ancestor with `transform`, `filter`,
`backdrop-filter`, `contain` or `will-change` becomes their containing block, so the full-screen overlay
collapses to that ancestor's box.

## Types

Derive a variant or size union from the component. The internal unions are not exported:

```tsx
import type { ComponentProps } from 'react'
import { Button } from '@appica/ui-react/button'

type ButtonVariant = ComponentProps<typeof Button>['variant']
```

`ref` is a plain prop on every component (React 19), so a wrapper of your own needs no `forwardRef`.
