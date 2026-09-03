<script lang="ts">
  import { cn } from '../../internal/utils'

  let { class: className }: { class?: string } = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 16 16"
  fill="currentColor"
  aria-hidden="true"
  class={cn(className)}
>
  <path
    d="M9.594 3.594c.225-.225.588-.225.812 0s.225.588 0 .812L6.812 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812l4-4z"
  />
</svg>
