<script lang="ts">
  import {
    DirectionProvider,
    Field,
    FieldLabel,
    Select,
    SelectContent,
    SelectGroup,
    SelectGroupLabel,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    Switch,
  } from '@appica/ui-svelte'

  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Select</h2>

  <label class="flex items-center gap-2 text-sm">
    <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
    RTL
  </label>

  <DirectionProvider {dir}>
    <div class="flex max-w-sm flex-col gap-6" {dir}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>Citrus</SelectGroupLabel>
            <SelectItem value="orange" label="Orange">Orange</SelectItem>
            <SelectItem value="lemon" label="Lemon">Lemon</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Berries</SelectGroupLabel>
            <SelectItem value="strawberry" label="Strawberry">Strawberry</SelectItem>
            <SelectItem value="blueberry" label="Blueberry" disabled>Blueberry</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select defaultValue="orange">
        <SelectTrigger clearable>
          <SelectValue placeholder="Clearable" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="orange" label="Orange">Orange</SelectItem>
          <SelectItem value="lemon" label="Lemon">Lemon</SelectItem>
        </SelectContent>
      </Select>

      <Field invalid>
        <FieldLabel>Invalid</FieldLabel>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Needs a value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orange" label="Orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  </DirectionProvider>
</section>
