import Layout from '../components/Layout'
import { Link, useParams } from 'react-router-dom'

import { LANG_META, resolveLang } from '../lib/languages'
import BengaliGuide from './guides/BengaliGuide'

export default function LanguageGuide(){
  const { lang: raw } = useParams()
  const lang = resolveLang(raw)
  const meta = LANG_META[lang]

  return (
    <Layout>
      <article className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow">
        <header className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{meta.flag} {meta.label} 読み方ガイド（地名向け）</h2>
          <Link to={`/${lang}`} className="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:underline">クイズへ ↩</Link>
        </header>

        <BengaliGuide />
        <div className="mt-6 flex justify-end">
          <Link to={`/${lang}`} className="px-4 py-2 rounded-full border border-blue-300 bg-[var(--primary)] text-white shadow">クイズに戻る</Link>
        </div>
      </article>
    </Layout>
  )
}
