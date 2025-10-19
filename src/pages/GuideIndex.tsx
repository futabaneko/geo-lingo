import Layout from '../components/Layout'
import { LANG_META } from '../lib/languages'
import { Link } from 'react-router-dom'

export default function GuideIndex(){
  const langs = Object.values(LANG_META)
  return (
    <Layout>
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow">
        <h1 className="text-2xl sm:text-3xl font-bold">ガイド</h1>
        <p className="mt-2 text-[var(--muted)]">言語別に、地名の読み方の要点をまとめました。</p>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {langs.map(lang => (
            <Link
              key={lang.key}
              to={`/${lang.key}/guide`}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 hover:shadow"
            >
              <span className="text-2xl" aria-hidden>{lang.flag}</span>
              <div>
                <div className="font-semibold">{lang.label}</div>
                <div className="text-sm text-[var(--muted)]">基礎の読み・表記のコツ</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--muted)]">順次追加予定。</p>
      </section>
    </Layout>
  )
}
