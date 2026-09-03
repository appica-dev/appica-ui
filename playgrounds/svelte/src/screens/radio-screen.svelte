<script lang="ts">
  import { Radio, RadioGroup } from '@appica/ui-svelte'

  let channel = $state('email')
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Radio</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical ({channel})</p>
    <RadioGroup bind:value={channel} aria-label="Channel">
      <label class="flex items-center gap-2 text-sm">
        <Radio value="email" />
        Email
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Radio value="sms" />
        SMS
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Radio value="push" />
        Push
      </label>
    </RadioGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Horizontal</p>
    <RadioGroup orientation="horizontal" defaultValue="left" aria-label="Alignment">
      <label class="flex items-center gap-2 text-sm">
        <Radio value="left" />
        Left
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Radio value="center" />
        Center
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Radio value="right" />
        Right
      </label>
    </RadioGroup>
  </div>

  <RadioGroup defaultValue="a" aria-label="States">
    <label class="flex items-center gap-2 text-sm">
      <Radio value="a" disabled />
      Disabled
    </label>
    <label class="flex items-center gap-2 text-sm">
      <Radio value="b" aria-invalid={true} />
      Invalid
    </label>
  </RadioGroup>
</section>
