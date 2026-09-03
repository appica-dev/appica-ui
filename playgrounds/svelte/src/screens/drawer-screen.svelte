<script lang="ts">
  import {
    Drawer,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    buttonVariants,
    type DrawerSide,
  } from '@appica/ui-svelte'

  const sides: DrawerSide[] = ['top', 'right', 'bottom', 'left']
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Drawer</h2>

  <div class="flex flex-wrap gap-3">
    {#each sides as side (side)}
      <Drawer {side}>
        <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>{side}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer ({side})</DrawerTitle>
            <DrawerDescription>Slides in from the {side}.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Swipe physics are CSS-only on this port.</DrawerBody>
          <DrawerFooter>
            <DrawerClose class={buttonVariants({ variant: 'outline' })}>Close</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    {/each}

    <Drawer>
      <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>Nested</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Outer</DrawerTitle>
          <DrawerDescription>The inner drawer omits a second backdrop.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Drawer>
            <DrawerTrigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>Open nested</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Inner</DrawerTitle>
                <DrawerDescription>Nested drawer</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>Backdrop stays on the outer drawer only.</DrawerBody>
            </DrawerContent>
          </Drawer>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  </div>
</section>
