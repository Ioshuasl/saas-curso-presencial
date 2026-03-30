export type ConfigSettingsValue =
  | string
  | number
  | boolean
  | null
  | ConfigSettingsObject
  | ConfigSettingsValue[]

export type ConfigSettingsObject = {
  [key: string]: ConfigSettingsValue
}

export type Config = {
  id: number
  tenant_id: number
  settings: ConfigSettingsObject
  created_at?: string
  updated_at?: string
}

/**
 * O backend aceita:
 * - `{ settings: { ... } }` (recomendado), ou
 * - objeto plano para merge em `settings`.
 */
export type UpdateConfigRequest = {
  settings?: ConfigSettingsObject
} & ConfigSettingsObject

