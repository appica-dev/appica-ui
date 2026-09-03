<script lang="ts">
  import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarImage } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Avatar</h2>
  <div class="flex flex-wrap items-center gap-4">
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage src="https://picsum.photos/80" alt="Portrait" />
      <AvatarFallback>AB</AvatarFallback>
      <AvatarBadge animate />
    </Avatar>
    <Avatar size="lg" shape="rounded">
      <AvatarFallback>LG</AvatarFallback>
    </Avatar>
    <AvatarGroup size="md">
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  </div>
</section>
