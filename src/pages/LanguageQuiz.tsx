import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import MapView from '../components/MapView'
import { LANG_META, resolveLang } from '../lib/languages'

type City = {
  id: string
  native_string: string
  primary_answer: string
  allowed_answers: string[]
  language: string
  lat?: number
  lng?: number
}

type Quiz = {
  question: { id: string; native_string: string }
  choices: { id: string; text: string }[]
  correct_answer_id: string
}


function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuiz(all: City[]): Quiz {
  if (!Array.isArray(all) || all.length < 4) throw new Error('データが不足しています（4件以上必要）')
  const correct = all[Math.floor(Math.random() * all.length)]
  const distractors = shuffle(all.filter(x => x.id !== correct.id)).slice(0, 3)
  const choices = shuffle([
    { id: correct.id, text: correct.primary_answer },
    ...distractors.map(d => ({ id: d.id, text: d.primary_answer })),
  ])
  return { question: { id: correct.id, native_string: correct.native_string }, choices, correct_answer_id: correct.id }
}

export default function LanguageQuiz() {
  const { lang: raw } = useParams()
  const lang = resolveLang(raw)
  const meta = LANG_META[lang]

  const [data, setData] = useState<City[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [mode, setMode] = useState<'choice' | 'hard'>('choice')
  const [inputText, setInputText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const correctText = useMemo(() => quiz?.choices.find(c => c.id === quiz?.correct_answer_id)?.text ?? '', [quiz])
  const correctCity: City | undefined = useMemo(() => (data && quiz) ? data.find(c => c.id === quiz.correct_answer_id) : undefined, [data, quiz])

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/${meta.data}`
    setLoading(true); setError(null)
    fetch(url, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`); return r.json() })
      .then((d: City[]) => setData(d))
      .catch(e => { console.error(e); setError('データの読み込みに失敗しました。サーバー経由でアクセスしているかをご確認ください。') })
      .finally(() => setLoading(false))
  }, [lang])

  useEffect(() => { if (data) setQuiz(buildQuiz(data)); setPicked(null) }, [data])

  function pick(id: string) { if (!quiz || picked) return; setPicked(id) }
  function next() {
    if (!data) return
    setQuiz(buildQuiz(data))
    setPicked(null)
    // 自由入力モードの入力は次の問題に進む際にクリア
    setInputText('')
  }

  // normalize strings for comparison
  function norm(s: string){
    return s
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/[.,'`’\-]/g, '') // strip common punctuation
      .replace(/\s+/g, '') // remove all spaces
  }

  function submitHard(){
    if (!quiz || picked) return
    const ans = norm(inputText)
    const city = correctCity
    const accepted = city ? [city.primary_answer, ...(city.allowed_answers||[])] : []
    const ok = accepted.some(a => norm(a) === ans)
    setPicked(ok ? quiz.correct_answer_id : 'hard_wrong')
  }

  // focus input when switching to hard mode
  useEffect(() => {
    if (mode === 'hard') {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [mode, quiz?.question.id])

  // when switching modes, clear previous answer/input
  useEffect(() => {
    setPicked(null)
    setInputText('')
  }, [mode])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!quiz) return
    const key = e.key
    if (!picked) {
      if (mode === 'choice') {
        if (['1','2','3','4'].includes(key)) {
          const idx = Number(key) - 1
          const target = quiz.choices[idx]
          if (target) { e.preventDefault(); pick(target.id) }
        }
      } else {
        if (key === 'Enter') { e.preventDefault(); submitHard() }
      }
    } else {
      if (key === 'Enter' || key === ' ') { e.preventDefault(); next() }
    }
  }, [quiz, picked])

  useEffect(() => { window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey) }, [handleKey])

  return (
    <Layout>
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow">
        {/* Language badge row */}
        <div className="mb-2 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
            <span aria-hidden>{meta.flag}</span>
            <span>{meta.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* mode toggle */}
            <div className="inline-flex overflow-hidden rounded-full border border-[var(--border)] bg-[var(--card)] text-xs">
              <button
                onClick={() => setMode('choice')}
                className={`px-3 py-1.5 ${mode==='choice' ? 'bg-[var(--bg)] text-[var(--text)]' : 'text-[var(--muted)]'}`}
                aria-pressed={mode==='choice'}
                title="4択モード"
              >4択</button>
              <button
                onClick={() => setMode('hard')}
                className={`px-3 py-1.5 ${mode==='hard' ? 'bg-[var(--bg)] text-[var(--text)]' : 'text-[var(--muted)]'}`}
                aria-pressed={mode==='hard'}
                title="自由入力モード（ハード）"
              >自由入力</button>
            </div>
            {/* shortcut tooltip */}
            <div className="relative group">
              <button
                className="w-8 h-8 grid place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                aria-label="ショートカットの説明"
                title="ショートカット"
                tabIndex={0}
              >
                ?
              </button>
              <div className="pointer-events-none absolute right-0 mt-2 hidden w-[220px] rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-xs text-[var(--muted)] shadow group-hover:block group-focus-within:block">
                <div className="font-semibold text-[var(--text)] mb-1">ショートカット</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>1–4: 選択肢を選ぶ</li>
                  <li>Enter / Space: 次の問題へ</li>
                </ul>
              </div>
            </div>
            <Link
              to={`/${lang}/guide`}
              className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:underline"
              title="ヒントを見る"
              aria-label="ヒントを見る"
            >
              <span aria-hidden>💡</span>
              <span className="hidden sm:inline">ヒント</span>
            </Link>
          </div>
        </div>

        <h2 className="sr-only">問題</h2>
        <div
          key={quiz?.question.id}
          className="font-bengali text-5xl text-center my-2 tracking-wide animate-fade-slide"
          aria-live="polite"
        >
          {error ? '' : quiz?.question.native_string ?? (loading ? '読み込み中…' : '…')}
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-lg border border-[var(--danger)] text-[var(--danger)] bg-[color:rgb(239_68_68_/_0.06)]">{error}</div>
        )}

        {mode === 'choice' ? (
          <div
            key={quiz?.question.id + ':choices'}
            className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))] animate-fade-slide"
            role="group"
            aria-label="選択肢"
          >
            {quiz?.choices.map(ch => {
              const isPicked = picked === ch.id
              const isCorrect = ch.id === quiz.correct_answer_id
              const state = picked ? (isCorrect ? 'correct' : isPicked ? 'wrong' : 'idle') : 'idle'
              return (
                <button
                  key={ch.id}
                  className={
                    'w-full px-4 py-3 text-base rounded-[14px] border shadow ' +
                    (state === 'correct' ? 'border-[var(--accent)]' : state === 'wrong' ? 'border-[var(--danger)]' : 'border-[var(--border)] bg-[var(--card)]')
                  }
                  onClick={() => pick(ch.id)}
                  disabled={!!picked}
                >
                  {ch.text}
                </button>
              )
            })}
          </div>
        ) : (
          <form className="mt-3 flex items-center gap-2 animate-fade-slide" onSubmit={(e)=>{e.preventDefault(); submitHard();}}>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e)=>setInputText(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)]"
              placeholder="ローマ字で入力（例: Dhaka）"
              disabled={!!picked}
              aria-label="解答を入力"
            />
            {!picked ? (
              <button type="submit" className="px-4 py-2 rounded-full border shadow border-blue-300 bg-[var(--primary)] text-white disabled:opacity-60" disabled={!inputText.trim()}>
                回答
              </button>
            ) : null}
          </form>
        )}

        {picked && (
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 animate-fade-slide">
            <div aria-live="polite" role="status">
              {picked === quiz?.correct_answer_id ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)] text-[var(--accent)] bg-[var(--card)]"><span aria-hidden>✓</span>正解</span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--danger)] text-[var(--danger)] bg-[var(--card)]"><span aria-hidden>✕</span>不正解<span className="ml-1 text-[var(--muted)]">答え: {correctText}</span></span>
              )}
            </div>
            <button onClick={next} className="px-5 py-2.5 rounded-full border shadow border-blue-300 bg-[var(--primary)] text-white disabled:opacity-70" disabled={!picked}>次の問題へ</button>
          </div>
        )}

        {picked && correctCity && (
          <div className="mt-4">
            <MapView name={correctCity.primary_answer} lat={correctCity.lat} lng={correctCity.lng} />
          </div>
        )}
      </section>
    </Layout>
  )
}
