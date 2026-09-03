import { getContext, setContext } from 'svelte'
import type { AvatarPresetSize, AvatarShape } from './avatar-variants'

export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarContextValue {
  status: AvatarStatus
  setStatus: (status: AvatarStatus) => void
  size?: AvatarPresetSize | number
  shape?: AvatarShape
}

export interface AvatarGroupContextValue {
  size?: AvatarPresetSize | number
  shape?: AvatarShape
}

const AVATAR_KEY = Symbol('appica-avatar')
const GROUP_KEY = Symbol('appica-avatar-group')

export function setAvatarContext(value: AvatarContextValue) {
  setContext(AVATAR_KEY, value)
}

export function getAvatarContext(): AvatarContextValue | undefined {
  return getContext<AvatarContextValue>(AVATAR_KEY)
}

export function setAvatarGroupContext(value: AvatarGroupContextValue) {
  setContext(GROUP_KEY, value)
}

export function getAvatarGroupContext(): AvatarGroupContextValue | undefined {
  return getContext<AvatarGroupContextValue>(GROUP_KEY)
}
