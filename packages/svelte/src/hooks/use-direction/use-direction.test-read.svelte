<script lang="ts">
  import { useDirection } from './use-direction'
  const direction = useDirection()
</script>

<span data-testid="dir">{direction.current}</span>
