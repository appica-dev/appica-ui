# Forms

`Field` pairs 1 control with its label, description and error, and wires the accessibility relationships.
`Form` coordinates the fields and shows server errors. Full text: `https://appica.dev/ui/docs/react/forms.md`.

## Contents

- [A field](#a-field)
- [Validation](#validation)
- [Submitting](#submitting)
- [Server errors](#server-errors)
- [Controls that are not native inputs](#controls-that-are-not-native-inputs)
- [Groups](#groups)

## A field

```tsx
import { Field, FieldDescription, FieldError, FieldLabel } from '@appica/ui-react/field'
import { Input } from '@appica/ui-react/input'

<Field name="email">
  <FieldLabel>Email</FieldLabel>
  <Input type="email" required />
  <FieldDescription>Receipts go to this address.</FieldDescription>
  <FieldError />
</Field>
```

- `name` goes on the `Field`, not on the control. It propagates to whatever the field wraps, and it is the key
  `Form` matches server errors against.
- The `for`/`id` and `aria-describedby` links are made for you. There is no separate Label component.
- `Field` passes `invalid` and `disabled` down, so `<Field disabled>` disables the control it wraps.
- Inputs are uncontrolled by default. Read values from `FormData` on submit, or control one with `value` and
  `onValueChange` when the UI depends on it.

## Validation

- **Native constraints** (`required`, `type`, `min`, `maxLength`, `pattern`) are validated automatically. A bare
  `<FieldError />` shows the browser's message. `<FieldError match="valueMissing">` shows your own for 1
  failure, and you can stack several with different `match` values (`typeMismatch`, `tooShort`, ...).
- **Custom rules** go in `validate` on the `Field`. It receives the value and the form's values. Return a
  string or an array of strings to fail, `null` to pass. It may be async.
- **`validationMode`** is `'onSubmit'` (the default: validate on submit, then again on every change),
  `'onBlur'` or `'onChange'`. Set it on the `Form` for every field, or on 1 `Field` to override.

```tsx
<Field
  name="username"
  validationMode="onBlur"
  validate={(value) => (String(value).length < 3 ? 'At least 3 characters.' : null)}
>
  <FieldLabel>Username</FieldLabel>
  <Input />
  <FieldError />
</Field>
```

`validate` is a function, so a form that uses it lives in a `'use client'` component.

## Submitting

`Button` renders `type="button"`. Inside a form it submits nothing until you write `type="submit"`:

```tsx
<Button type="submit">Save</Button>
```

`Form` renders a real `<form>`, so it takes a server `action` or `onSubmit`. `onFormSubmit` is the shortcut
for a client handler: it receives the values as an object keyed by field name, and has already called
`preventDefault()`. None of them runs while a field fails validation. An async `validate` is the exception:
it cannot hold a submit back, so repeat that check on the server.

## Server errors

Return errors keyed by field name and pass them to `errors`. Each `Field` shows its own message in its
`FieldError`, in the same place as client-side validation:

```tsx
'use client'

import { useActionState } from 'react'
import { Form } from '@appica/ui-react/form'

const [state, formAction] = useActionState(signUp, { errors: {} })

<Form action={formAction} errors={state.errors}>
  <Field name="email">
    <FieldLabel>Email</FieldLabel>
    <Input type="email" required />
    <FieldError />
  </Field>
  <Button type="submit">Create account</Button>
</Form>
```

With a client handler instead of an action, keep the errors in state and pass them the same way. A server
error clears by itself when its field is edited, so there is nothing to reset. Do not render server errors by
hand beside the field: without `errors` the field is never marked invalid.

## Controls that are not native inputs

- **Every named control lands in `FormData`.** `Select`, `Checkbox`, `Switch` and the others render a hidden
  input for it. A checked checkbox submits `on`.
- **`Select` shows the raw value unless it has `items`.** The `SelectItem`s live in a portal that is not
  mounted while the popup is closed, so the trigger cannot read their labels. Pass the value-to-label map:

```tsx
const PLANS = { free: 'Free', pro: 'Pro' }

<Field name="plan">
  <FieldLabel>Plan</FieldLabel>
  <Select defaultValue="free" items={PLANS}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="free">Free</SelectItem>
      <SelectItem value="pro">Pro</SelectItem>
    </SelectContent>
  </Select>
</Field>
```

- **A `Select` with a `startSlot` needs `alignItemWithTrigger={false}`**, or the popup opens off position.
- **A shake on invalid** is 1 class on the control: `className="data-invalid:motion-safe:animate-shake"`.

## Groups

`FieldLabel` renders a `<label for>`, which can name only a single control. A group (`RadioGroup`,
`CheckboxGroup`, `ToggleGroup`) and a segmented field (`DateField`, `TimeField`, `DatePicker`) are
`role="group"`, so name them with `aria-label`, or with `aria-labelledby` pointing at a visible caption:

```tsx
<span id="plan-label">Plan</span>
<RadioGroup aria-labelledby="plan-label" defaultValue="pro">...</RadioGroup>
```

`Fieldset` with `FieldsetLegend` groups related fields under 1 legend.
