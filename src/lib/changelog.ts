export type ChangeTag = 'feat' | 'fix' | 'chore' | 'docs' | 'perf' | 'refactor'

export type ChangeLogEntry = {
  date: string // YYYY-MM-DD
  title: string
  version: string
  items: { tag: ChangeTag; text: string }[]
}

export const CHANGELOG: ChangeLogEntry[] = [
      {
    date: '2025-10-20',
        title: '読みヒントモード',
        version: 'alpha 1.2.0',
        items: [
        { tag: 'feat', text: '読みヒントモードを追加' },
        { tag: 'fix', text: 'クイズページのレスポンシブデザインを修正' },
        ],
    },
    {
    date: '2025-10-20',
        title: 'ベンガル語の辞書拡充',
        version: 'alpha 1.1.0',
        items: [
        { tag: 'feat', text: '辞書に地名を 90 件追加（ベンガル語）' },
        { tag: 'feat', text: 'クイズに難易度選択を追加' },
        { tag: 'feat', text: '更新履歴ページを追加' },
        { tag: 'feat', text: 'その他UIを改善' },
        ],
    },
    {
        date: '2025-10-19',
        title: '初版公開',
        version: 'alpha 1.0.0',
        items: [
        { tag: 'feat', text: '各種ページ作成' },
        { tag: 'feat', text: 'クイズ追加（ベンガル語）' },
        { tag: 'feat', text: 'ガイド追加（ベンガル語）' },
        ],
    },
]

export function getChangelog() {
  return CHANGELOG
}
