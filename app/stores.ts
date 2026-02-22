import { persistentMap } from '@nanostores/persistent'
import pkg from '~/package.json' with { type: 'json' }

export const STORAGE_KEY = `${pkg.name}:`

// Auth store type definition
export interface AuthStore {
  token: string | null
  expiry: number | null
  session: string | null
}

// Persistent authentication state store
export const authStore = persistentMap<AuthStore>(
  STORAGE_KEY,
  {
    token: null,
    expiry: null,
    session: null
  },
  {
    encode: encodeValue,
    decode: decodeValue
  }
)

// Helper to encode/decode primitive values for localStorage
function encodeValue(value: string | number | boolean | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

function decodeValue(encoded: string): string | number | null {
  if (encoded === '') return null
  const num = Number(encoded)
  return !Number.isNaN(num) ? num : encoded
}

export interface UIStore {
  sidebar: 'show' | 'hide'
  theme: 'light' | 'dark'
}

const uiStoreDefaults: UIStore = {
  sidebar: 'hide',
  theme: 'light'
}

export const uiStore = persistentMap<UIStore>(STORAGE_KEY, uiStoreDefaults, {
  encode: (value: UIStore[keyof UIStore]) => (value == null ? '' : String(value)),
  decode: (encoded: string, key?: keyof UIStore): UIStore[keyof UIStore] => {
    if (key === 'sidebar') {
      return encoded === 'show' || encoded === 'hide' ? encoded : uiStoreDefaults.sidebar
    }
    if (key === 'theme') {
      return encoded === 'light' || encoded === 'dark' ? encoded : uiStoreDefaults.theme
    }
    return encoded === '' ? uiStoreDefaults.sidebar : (encoded as UIStore[keyof UIStore])
  }
})
