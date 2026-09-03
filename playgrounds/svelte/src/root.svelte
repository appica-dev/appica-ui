<script lang="ts">
  import { ThemeProvider } from '@appica/ui-svelte'
  import App from './app.svelte'
</script>

<ThemeProvider disableTransitionOnChange>
  <App />
</ThemeProvider>
