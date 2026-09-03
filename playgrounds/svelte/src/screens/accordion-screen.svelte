<script lang="ts">
  import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Accordion</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Single</p>
    <Accordion class="max-w-md">
      <AccordionItem value="one">
        <AccordionTrigger>What is Appica UI?</AccordionTrigger>
        <AccordionContent>
          <p class="text-foreground-muted pb-3 text-sm">A shared component library for React and Svelte.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Can several items stay open?</AccordionTrigger>
        <AccordionContent>
          <p class="text-foreground-muted pb-3 text-sm">Set <code>multiple</code> on the root.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Multiple</p>
    <Accordion multiple class="max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>First</AccordionTrigger>
        <AccordionContent>
          <p class="text-foreground-muted pb-3 text-sm">Both panels can stay open.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Second</AccordionTrigger>
        <AccordionContent>
          <p class="text-foreground-muted pb-3 text-sm">Open this without closing the first.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</section>
