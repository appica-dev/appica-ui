<script lang="ts">
  import { useTheme } from '../../hooks/use-theme/use-theme'

  const theme = useTheme()
</script>

<button type="button" data-testid="theme-probe" onclick={() => theme.setTheme('dark')}>
  {theme.theme ?? 'none'}|{theme.resolvedTheme ?? 'none'}|{theme.mounted ? 'mounted' : 'pending'}
</button>
