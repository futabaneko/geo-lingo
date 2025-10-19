export const LANG_META = {
  bengali: {
    key: 'bengali',
    label: 'ベンガル語',
    flag: '🇧🇩',
    data: 'bengali.json',
  },
} as const

export type LanguageKey = keyof typeof LANG_META

export function resolveLang(raw?: string): LanguageKey {
  return (raw && raw in LANG_META ? (raw as LanguageKey) : 'bengali')
}
