import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Home(){
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {/* gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]">
          <div className="absolute -inset-40 bg-[conic-gradient(from_180deg_at_50%_50%,_#60a5fa_0deg,_#34d399_120deg,_#f472b6_240deg,_#60a5fa_360deg)] animate-[spin_22s_linear_infinite]" />
        </div>

        <div className="relative p-8 sm:p-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Geo-Lingo</h1>
          <p className="mt-3 text-[var(--muted)]">読めない地名を、読める地名へ。Geoguessr をもっと楽しく。</p>

          {/* Language cards (parallel, stylish) */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/bengali" className="group rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6 text-left hover:shadow no-underline">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>🇧🇩</span>
                  <span className="text-xl font-semibold">ベンガル語</span>
                </div>
              
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">4択クイズ + 回答後に地図表示</div>
            </Link>

            {/* Coming soon languages */}
            <div className="group rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-left opacity-85">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>🇹🇭</span>
                  <span className="text-xl font-semibold">タイ語</span>
                </div>
                <span className="text-xs text-[var(--muted)] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-full">近日公開</span>
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">読み方ガイドとクイズを順次追加</div>
            </div>

            <div className="group rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-left opacity-85">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>🇰🇷</span>
                  <span className="text-xl font-semibold">韓国語</span>
                </div>
                <span className="text-xs text-[var(--muted)] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-full">近日公開</span>
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">ハングル地名の読み分け</div>
            </div>

            <div className="group rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-left opacity-85">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>🇷🇺</span>
                  <span className="text-xl font-semibold">キリル文字圏</span>
                </div>
                <span className="text-xs text-[var(--muted)] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-full">近日公開</span>
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">ロシア語・ブルガリア語など</div>
            </div>
          </div>

          {/* Guides entry with explanation */}
          <div className="mt-10">
            <p className="text-sm text-[var(--muted)] mb-2">まずは読みのコツを知りたい方は、言語別ガイドからどうぞ。</p>
            <Link to="/guide" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-3.5 text-base hover:shadow">
              <span aria-hidden>📘</span>
              <span>ガイド（言語を選ぶ）</span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
