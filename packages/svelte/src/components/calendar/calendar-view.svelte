<script lang="ts">
  import { Calendar as BitsCalendar, RangeCalendar as BitsRangeCalendar } from 'bits-ui'
  import { cn } from '../../internal/utils'
  import CalendarChevron from './calendar-chevron.svelte'
  import CalendarDropdown from './calendar-dropdown.svelte'
  import {
    DAY_BUTTON_BASE,
    HEADER_GAP,
    MONTH_GAP,
    NAV_BUTTON_CLASS,
    NEXT_CHEVRON_FLIP,
    PREV_CHEVRON_FLIP,
    RANGE_CELL,
    ROOT_CONFIG,
    ROUNDED,
    ROW_GAP,
    WEEKDAY_PADDING,
    fireNativeSelectChange,
    formatCalendarMonth,
    type CalendarCaptionLayout,
    type CalendarMonth,
    type CalendarSize,
  } from './calendar-tokens'

  let {
    size,
    range = false,
    captionLayout = 'dropdown',
    showOutsideDays = true,
    locale,
    years,
    months,
    weekdays,
  }: {
    size: CalendarSize
    range?: boolean
    captionLayout?: CalendarCaptionLayout
    showOutsideDays?: boolean
    locale?: string
    years: number[]
    months: CalendarMonth[]
    weekdays: string[]
  } = $props()

  const Header = $derived(range ? BitsRangeCalendar.Header : BitsCalendar.Header)
  const PrevButton = $derived(range ? BitsRangeCalendar.PrevButton : BitsCalendar.PrevButton)
  const NextButton = $derived(range ? BitsRangeCalendar.NextButton : BitsCalendar.NextButton)
  const MonthSelect = $derived(range ? BitsRangeCalendar.MonthSelect : BitsCalendar.MonthSelect)
  const YearSelect = $derived(range ? BitsRangeCalendar.YearSelect : BitsCalendar.YearSelect)
  const Heading = $derived(range ? BitsRangeCalendar.Heading : BitsCalendar.Heading)
  const Grid = $derived(range ? BitsRangeCalendar.Grid : BitsCalendar.Grid)
  const GridHead = $derived(range ? BitsRangeCalendar.GridHead : BitsCalendar.GridHead)
  const GridRow = $derived(range ? BitsRangeCalendar.GridRow : BitsCalendar.GridRow)
  const HeadCell = $derived(range ? BitsRangeCalendar.HeadCell : BitsCalendar.HeadCell)
  const GridBody = $derived(range ? BitsRangeCalendar.GridBody : BitsCalendar.GridBody)
  const Cell = $derived(range ? BitsRangeCalendar.Cell : BitsCalendar.Cell)
  const Day = $derived(range ? BitsRangeCalendar.Day : BitsCalendar.Day)

  const cfg = $derived(ROOT_CONFIG[size])
  const rounded = $derived(ROUNDED[size])
  const showMonthSelect = $derived(captionLayout === 'dropdown' || captionLayout === 'dropdown-months')
  const showYearSelect = $derived(captionLayout === 'dropdown' || captionLayout === 'dropdown-years')
  const showHeading = $derived(captionLayout === 'label')
  const captionDate = $derived(months[0]?.value)

  function selectItems(items: Array<{ value: number; label: string }> | undefined) {
    return items?.map((item) => ({ value: String(item.value), label: item.label })) ?? []
  }
</script>

<Header>
  {#snippet child({ props })}
    <div
      {...props}
      class={cn(
        'relative',
        MONTH_GAP[size],
        typeof props.class === 'string' ? props.class : undefined,
      )}
    >
      <div class="pointer-events-none absolute inset-x-0 top-0 flex h-(--cell-size) items-center justify-between">
        <PrevButton>
          {#snippet child({ props: navProps })}
            <button
              {...navProps}
              type="button"
              aria-label="Previous month"
              class={cn(
                NAV_BUTTON_CLASS[size],
                'pointer-events-auto',
                PREV_CHEVRON_FLIP,
                typeof navProps.class === 'string' ? navProps.class : undefined,
              )}
            >
              <CalendarChevron />
            </button>
          {/snippet}
        </PrevButton>
        <NextButton>
          {#snippet child({ props: navProps })}
            <button
              {...navProps}
              type="button"
              aria-label="Next month"
              class={cn(
                NAV_BUTTON_CLASS[size],
                'pointer-events-auto',
                NEXT_CHEVRON_FLIP,
                typeof navProps.class === 'string' ? navProps.class : undefined,
              )}
            >
              <CalendarChevron />
            </button>
          {/snippet}
        </NextButton>
      </div>
      <div
        class={cn(
          'flex h-(--cell-size) items-center justify-center px-[calc(var(--cell-size)+0.5rem)]',
          showHeading ? 'text-foreground-intense font-medium' : undefined,
        )}
      >
        {#if showHeading}
          <Heading />
        {:else}
          <div class={cn('flex items-center', HEADER_GAP[size])}>
            {#if showMonthSelect}
              <MonthSelect monthFormat="short">
                {#snippet child({ props: selectProps, monthItems, selectedMonthItem })}
                  <CalendarDropdown
                    {size}
                    value={String(selectedMonthItem?.value ?? '')}
                    items={selectItems(monthItems)}
                    disabled={Boolean(selectProps.disabled)}
                    id={typeof selectProps.id === 'string' ? selectProps.id : undefined}
                    ariaLabel={typeof selectProps['aria-label'] === 'string' ? selectProps['aria-label'] : 'Month'}
                    onChange={(value) => fireNativeSelectChange(selectProps.onchange, value)}
                  />
                {/snippet}
              </MonthSelect>
            {:else if captionDate}
              <span class="text-foreground-intense font-medium">{formatCalendarMonth(captionDate, locale)}</span>
            {/if}
            {#if showYearSelect}
              <YearSelect {years}>
                {#snippet child({ props: selectProps, yearItems, selectedYearItem })}
                  <CalendarDropdown
                    {size}
                    value={String(selectedYearItem?.value ?? '')}
                    items={selectItems(yearItems)}
                    disabled={Boolean(selectProps.disabled)}
                    id={typeof selectProps.id === 'string' ? selectProps.id : undefined}
                    ariaLabel={typeof selectProps['aria-label'] === 'string' ? selectProps['aria-label'] : 'Year'}
                    onChange={(value) => fireNativeSelectChange(selectProps.onchange, value)}
                  />
                {/snippet}
              </YearSelect>
            {:else if captionDate}
              <span class="text-foreground-intense font-medium">{captionDate.year}</span>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/snippet}
</Header>
<div class={cn('relative flex flex-col', MONTH_GAP[size])}>
  {#each months as month (month.value.toString())}
    <div class={cn('flex w-full flex-col', MONTH_GAP[size])}>
      {#if months.length > 1}
        <div class="text-foreground-intense flex h-(--cell-size) items-center justify-center font-medium">
          {formatCalendarMonth(month.value, locale, 'long')}
          {month.value.year}
        </div>
      {/if}
      <Grid class="w-full border-collapse select-none">
        <GridHead>
          <GridRow class="flex" role="row">
            {#each weekdays as day, i (i)}
              <HeadCell
                role="columnheader"
                class={cn(
                  'text-foreground-muted flex flex-1 items-end justify-center font-normal',
                  cfg.cellOuter,
                  WEEKDAY_PADDING[size],
                )}
              >
                {day.slice(0, 2)}
              </HeadCell>
            {/each}
          </GridRow>
        </GridHead>
        <GridBody>
          {#each month.weeks as weekDates, weekIndex (weekIndex)}
            <GridRow class={cn('flex w-full', ROW_GAP[size])} role="row">
              {#each weekDates as date (date.toString())}
                {@const isOutside = date.month !== month.value.month}
                <Cell
                  {date}
                  month={month.value}
                  class={cn(
                    'relative flex aspect-square flex-1 items-center justify-center p-0',
                    cfg.cellOuter,
                    range && RANGE_CELL[size],
                  )}
                >
                  {#if showOutsideDays || !isOutside}
                    <Day class={cn(DAY_BUTTON_BASE, rounded.full)} data-slot="calendar-day" />
                  {/if}
                </Cell>
              {/each}
            </GridRow>
          {/each}
        </GridBody>
      </Grid>
    </div>
  {/each}
</div>
