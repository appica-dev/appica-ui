import { getContext, setContext } from 'svelte'

export interface FieldContextValue {
  invalid: () => boolean
  disabled: () => boolean
  name: () => string | undefined
  controlId: string
  labelId: string
  descriptionId: string
  errorId: string
  formError: () => string | undefined
  clearFormError: () => void
}

type AriaInvalidValue = boolean | 'true' | 'false' | 'grammar' | 'spelling'

export interface MergedFieldControl {
  invalid: boolean
  disabled: boolean
  name: string | undefined
  id: string | undefined
  describedby: string | undefined
  ariaInvalid: AriaInvalidValue | undefined
}

const KEY = Symbol('appica-field')

export function setFieldContext(value: FieldContextValue) {
  setContext(KEY, value)
}

export function getFieldContext(): FieldContextValue | undefined {
  return getContext<FieldContextValue>(KEY)
}

export function requireFieldContext(): FieldContextValue {
  const ctx = getFieldContext()
  if (!ctx) {
    throw new Error('Field sub-components must be rendered inside <Field>')
  }
  return ctx
}

function toAriaInvalid(value: unknown, invalid: boolean): AriaInvalidValue | undefined {
  if (invalid) return true
  switch (value) {
    case true:
    case false:
    case 'true':
    case 'false':
    case 'grammar':
    case 'spelling':
      return value
    default:
      return undefined
  }
}

export function mergeFieldControl(opts: {
  field: FieldContextValue | undefined
  id?: string | null
  name?: string | null
  disabled?: boolean | null
  ariaInvalid?: unknown
  ariaDescribedby?: string | undefined | null
  /** Skip inheriting Field's control id (radio items, grouped controls). */
  omitId?: boolean
}): MergedFieldControl {
  const invalidFromAria = opts.ariaInvalid === true || opts.ariaInvalid === 'true'
  const invalid = invalidFromAria || Boolean(opts.field?.invalid())
  const disabled = opts.disabled ?? opts.field?.disabled() ?? false
  const name = opts.name ?? opts.field?.name()
  const id = opts.omitId ? (opts.id ?? undefined) : (opts.id ?? opts.field?.controlId)
  const describedParts = [
    opts.ariaDescribedby,
    opts.field?.descriptionId,
    invalid ? opts.field?.errorId : undefined,
  ].filter((part): part is string => Boolean(part))
  return {
    invalid,
    disabled,
    name,
    id,
    describedby: describedParts.length > 0 ? describedParts.join(' ') : undefined,
    ariaInvalid: toAriaInvalid(opts.ariaInvalid, invalid),
  }
}
