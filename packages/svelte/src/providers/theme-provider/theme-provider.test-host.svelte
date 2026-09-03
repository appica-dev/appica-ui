<script lang="ts">
  import ThemeProvider from './theme-provider.svelte'
  import ThemeProbe from './theme-probe.test-host.svelte'

  let {
    defaultTheme,
    enableSystem = false,
    forcedTheme,
    nested = false,
  }: {
    defaultTheme?: string
    enableSystem?: boolean
    forcedTheme?: string
    nested?: boolean
  } = $props()
</script>

<ThemeProvider {defaultTheme} {enableSystem} {forcedTheme}>
  {#if nested}
    <ThemeProvider forcedTheme="light">
      <ThemeProbe />
    </ThemeProvider>
  {:else}
    <ThemeProbe />
  {/if}
</ThemeProvider>
