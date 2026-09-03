<script lang="ts">
  import { cn } from '../../internal/utils'
  import Select from '../select/select.svelte'
  import SelectContent from '../select/select-content.svelte'
  import SelectItem from '../select/select-item.svelte'
  import SelectTrigger from '../select/select-trigger.svelte'
  import { SELECT_CONFIG, type CalendarSize } from './calendar-tokens'

  let {
    size,
    value,
    items,
    disabled,
    id,
    ariaLabel,
    onChange,
  }: {
    size: CalendarSize
    value: string
    items: Array<{ value: string; label: string }>
    disabled?: boolean
    id?: string
    ariaLabel?: string
    onChange: (value: string) => void
  } = $props()

  const cfg = $derived(SELECT_CONFIG[size])
  const selectedLabel = $derived(items.find((item) => item.value === value)?.label ?? value)

  function handleValueChange(next: string | string[]) {
    onChange(Array.isArray(next) ? (next[0] ?? '') : next)
  }
</script>

<Select size={cfg.size} variant="soft" {value} {disabled} onValueChange={handleValueChange}>
  <SelectTrigger {id} aria-label={ariaLabel} class={cn(cfg.extra)}>
    {selectedLabel}
  </SelectTrigger>
  <SelectContent>
    {#each items as opt (opt.value)}
      <SelectItem value={opt.value} label={opt.label}>{opt.label}</SelectItem>
    {/each}
  </SelectContent>
</Select>
