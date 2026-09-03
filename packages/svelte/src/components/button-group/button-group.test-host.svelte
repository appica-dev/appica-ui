<script lang="ts">
  import type { VariantProps } from 'class-variance-authority'
  import Button from '../button/button.svelte'
  import { buttonVariants } from '../button/button-variants'
  import ButtonGroup from './button-group.svelte'

  type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
  type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

  let {
    variant,
    size,
    disabled = false,
    orientation,
    class: className,
    overrideSize,
    overrideVariant,
    wrapped = false,
    ownDisabled = false,
    childDisabledFalse = false,
    solo = false,
    count = 2,
  }: {
    variant?: ButtonVariant
    size?: ButtonSize
    disabled?: boolean
    orientation?: 'horizontal' | 'vertical'
    class?: string
    overrideSize?: ButtonSize
    overrideVariant?: ButtonVariant
    wrapped?: boolean
    ownDisabled?: boolean
    childDisabledFalse?: boolean
    solo?: boolean
    count?: number
  } = $props()
</script>

{#if solo}
  <Button data-testid="solo">Solo</Button>
{:else}
  <ButtonGroup {variant} {size} {disabled} {orientation} class={className}>
    {#if wrapped}
      <span data-testid="wrapper">
        <Button data-testid="nested">Wrapped</Button>
      </span>
    {:else if overrideSize != null || overrideVariant != null}
      <Button size={overrideSize} variant={overrideVariant} data-testid="overridden">One</Button>
      <Button data-testid="inherits">Two</Button>
    {:else if childDisabledFalse}
      <Button disabled={false} data-testid="b">B</Button>
    {:else if ownDisabled}
      <Button disabled data-testid="own">Own</Button>
      <Button data-testid="other">Other</Button>
    {:else}
      {#if count >= 1}<Button data-testid="a">One</Button>{/if}
      {#if count >= 2}<Button data-testid="b">Two</Button>{/if}
      {#if count >= 3}<Button data-testid="c">Three</Button>{/if}
    {/if}
  </ButtonGroup>
{/if}
