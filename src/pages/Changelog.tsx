import Layout from '../components/Layout'
import { getChangelog } from '../lib/changelog'
import { Link } from 'react-router-dom'

function Tag({ tag }: { tag: 'feat' | 'fix' | 'chore' | 'docs' | 'perf' | 'refactor' }){
  const map: Record<string, string> = {
    feat: 'bg-emerald-600',
    fix: 'bg-rose-600',
    chore: 'bg-slate-500',
    docs: 'bg-indigo-500',
    perf: 'bg-amber-600',
    refactor: 'bg-blue-600',
  }
  const color = map[tag] ?? 'bg-slate-500'
  const label: Record<string, string> = {
    feat: '追加',
    fix: '修正',
    chore: '整備',
    docs: '文書',
    perf: '性能',
    refactor: '整理',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-white ${color} px-2 py-0.5 rounded-2xl`}>{label[tag]}</span>
  )
}

export default function Changelog(){
  const logs = getChangelog()
  return (
    <Layout>
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">更新履歴</h1>
          <Link to="/" className="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:underline">トップへ ↩</Link>
        </header>

        <ol className="mt-6 relative border-l border-[var(--border)] pl-1">
          {logs.map((entry, i) => (
            <li key={i} className="ml-6 py-3 relative">
              <span className="absolute -left-9 top-3.5 h-7 w-3.5 rounded-full bg-[var(--primary)] border border-[var(--border)] content-center" />
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-semibold text-lg">{entry.title}<span className="text-sm text-[var(--muted)] text-gray-400"> / {entry.version}</span></h2>
                <time className="text-sm text-[var(--muted)]">{entry.date}</time>
              </div>
              <ul className="mt-2 space-y-1">
                {entry.items.map((it, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <Tag tag={it.tag} />
                    <span>{it.text}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  )
}
