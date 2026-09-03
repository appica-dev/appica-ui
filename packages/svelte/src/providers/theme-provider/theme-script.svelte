<script lang="ts">
  import { getThemeScript, type ThemeScriptOptions } from './theme-script'

  interface Props extends ThemeScriptOptions {
    nonce?: string
  }

  let { nonce, ...options }: Props = $props()

  const html = $derived(getThemeScript(options))
</script>

<svelte:head>
  {@html `<script${nonce ? ` nonce="${nonce}"` : ''}>${html}</script>`}
</svelte:head>
