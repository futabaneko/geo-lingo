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
  importance?: 1 | 2 | 3
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

function pickPool(all: City[], selected: Set<1|2|3>): City[] {
  if (selected.size === 0 || selected.size === 3) return all
  return all.filter(c => (c.importance ?? 1) && selected.has((c.importance ?? 1) as 1|2|3))
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
  const [importance, setImportance] = useState<Set<1|2|3>>(new Set([2,3]))
  const [impOpen, setImpOpen] = useState(false)
  const [showReadings, setShowReadings] = useState(true)

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

  useEffect(() => { if (data) setQuiz(buildQuiz(pickPool(data, importance))); setPicked(null) }, [data, importance])

  // persist reading hint preference
  useEffect(() => {
    try {
      const v = localStorage.getItem('showReadings')
      if (v !== null) setShowReadings(v === '1')
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('showReadings', showReadings ? '1' : '0') } catch {}
  }, [showReadings])

  function pick(id: string) { if (!quiz || picked) return; setPicked(id) }
  function next() {
    if (!data) return
    setQuiz(buildQuiz(pickPool(data, importance)))
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

  // counts per importance
  const counts = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0 } as Record<1|2|3, number>
    for (const c of (data || [])) {
      const k = (c.importance ?? 1) as 1|2|3
      map[k]++
    }
    return map
  }, [data])

  // --- Reading (romanization) tooltip for Bengali graphemes ---
  const segmentGraphemes = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Seg: any = (Intl as any).Segmenter
      if (Seg) {
        const seg = new Seg('bn', { granularity: 'grapheme' })
        return (s: string) => Array.from(seg.segment(s), (x: { segment: string }) => x.segment)
      }
    } catch {}
    return (s: string) => Array.from(s)
  }, [])

  const BN_CONSONANTS: Record<string, string> = {
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
    'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
    'ট': 'ṭ', 'ঠ': 'ṭh', 'ড': 'ḍ', 'ঢ': 'ḍh', 'ণ': 'ṇ',
    'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
    'য': 'y', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y',
  }
  const BN_INDEP_VOWELS: Record<string, string> = {
    'অ': 'a', 'আ': 'ā', 'ই': 'i', 'ঈ': 'ī', 'উ': 'u', 'ঊ': 'ū',
    'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou'
  }
  const BN_MATRAS: Record<string, string> = {
    'া': 'ā', 'ি': 'i', 'ী': 'ī', 'ু': 'u', 'ূ': 'ū', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou'
  }
  const BN_SIGNS: Record<string, string> = { 'ঁ': '̃', 'ং': 'ṁ', 'ঃ': 'ḥ' }
  const VIRAMA = '্'

  function isBengaliRange(ch: string) {
    const code = ch.codePointAt(0) ?? 0
    return code >= 0x0980 && code <= 0x09FF
  }

  function romanizeBengaliGrapheme(g: string): string | undefined {
    // if independent vowel
    if (g in BN_INDEP_VOWELS) return BN_INDEP_VOWELS[g]
    // decompose inside the cluster
    const cps = Array.from(g)
    const cons: string[] = []
    let vowel: string | null = null
    let signs = ''
    for (const ch of cps) {
      if (BN_MATRAS[ch]) { vowel = BN_MATRAS[ch]; continue }
      if (BN_SIGNS[ch]) { signs += BN_SIGNS[ch]; continue }
      if (ch === VIRAMA) { continue }
      if (BN_CONSONANTS[ch]) { cons.push(BN_CONSONANTS[ch]); continue }
      // unknown within Bengali block
    }
    if (cons.length) return cons.join('') + (vowel ?? '?') + signs
    return undefined
  }

  function renderQuestionWithReadings(text: string) {
    const segs = segmentGraphemes(text)
    return (
      <span aria-label={text}>
        {segs.map((g, i) => {
          const isSpace = /^\s+$/.test(g)
          const reading = isBengaliRange(g) ? romanizeBengaliGrapheme(g) : undefined
          if (isSpace) {
            return <span key={i}>{g}</span>
          }
          return (
            <span key={i} className="relative inline-block group align-baseline">
              <span className="hover:underline decoration-dotted decoration-blue-400/60 underline-offset-[0.35em] decoration-skip-ink-none transition-colors">
                {g}
              </span>
              {reading && (
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[-3.2em] whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[10px] sm:text-xs text-[var(--text)] shadow opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-10">
                  {reading}
                </span>
              )}
            </span>
          )
        })}
      </span>
    )
  }

  return (
    <Layout>
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-6 shadow">
        {/* Language badge row */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
            <span aria-hidden>{meta.flag}</span>
            <span>{meta.label}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
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
            {/* importance filter popup */}
            <div className="relative">
              <button
                onClick={() => setImpOpen(v => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs"
                aria-expanded={impOpen}
                aria-haspopup="dialog"
                title="重要度選択"
              >
                <span aria-hidden>🎯</span>
                <span>重要度選択</span>
              </button>
              {impOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg p-3 z-20">
                  <div className="mb-2">
                    <div className="font-semibold text-sm">重要度で出題を絞り込み</div>
                    <p className="text-[var(--muted)] text-xs mt-1">3: 主要都市・州名 / 2: 地方都市 / 1: それ以外</p>
                  </div>
                  <div className="space-y-2">
                    {[3,2,1].map(level => {
                      const lv = level as 1|2|3
                      const active = importance.has(lv)
                      return (
                        <label key={lv} className="flex items-center justify-between gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => {
                                const next = new Set(importance)
                                active ? next.delete(lv) : next.add(lv)
                                if (next.size === 0) { next.add(1); next.add(2); next.add(3) }
                                setImportance(next)
                              }}
                            />
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs ${active ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>{lv}</span>
                            <span className="text-[var(--muted)]">{lv===3?'主要都市・州名': lv===2?'地方都市':'それ以外'}</span>
                          </div>
                          <span className="text-xs text-[var(--muted)]">{counts[lv]}件</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                    <button
                      className="px-2.5 py-1.5 rounded-full border border-[var(--border)]"
                      onClick={() => { setImportance(new Set([1,2,3])) }}
                    >全選択</button>
                    <button
                      className="px-3 py-1.5 rounded-full border shadow border-blue-300 bg-[var(--primary)] text-white"
                      onClick={() => setImpOpen(false)}
                    >閉じる</button>
                  </div>
                </div>
              )}
            </div>
            {/* reading hint toggle */}
            <div className="relative group">
              <button
                onClick={() => setShowReadings(v => !v)}
                className={`w-8 h-8 grid place-items-center rounded-full border bg-[var(--card)] ${showReadings ? 'border-[var(--primary)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
                aria-pressed={showReadings}
                aria-label="読みヒントの切替"
                title="読みヒントの切替"
              >
                <span aria-hidden>🔤</span>
              </button>
              <div 
                className="pointer-events-none absolute right-0 mt-4 hidden w-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-xs text-[var(--muted)] shadow group-hover:block group-focus-within:block whitespace-nowrap"
                role="tooltip"
              >
                <div className="font-semibold text-[var(--text)]">読みヒント: {showReadings ? 'ON' : 'OFF'}</div>
              </div>
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
              <div className="pointer-events-none absolute right-0 mt-3 hidden w-[220px] max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-xs text-[var(--muted)] shadow group-hover:block group-focus-within:block">
                <div className="font-semibold text-[var(--text)] mb-1">ショートカット</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>1–4: 選択肢を選ぶ</li>
                  <li>Enter / Space: 次の問題へ</li>
                </ul>
              </div>
            </div>
            <div className="relative group">

              <Link
                to={`/${lang}/guide`}
                className="w-8 h-8 grid place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                title="ヒントを見る"
                aria-label="ヒントを見る"
              >
                <span aria-hidden>💡</span>
              </Link>

              <div 
                className="pointer-events-none absolute right-0 mt-3 hidden w-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-xs text-[var(--muted)] shadow group-hover:block group-focus-within:block whitespace-nowrap"
                role="tooltip"
              >
                <div className="font-semibold text-[var(--text)]">ヒントを見る</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="sr-only">問題</h2>
        <div
          key={quiz?.question.id}
          className="font-bengali text-4xl sm:text-5xl text-center my-2 pt-10 pb-6 tracking-wide animate-fade-slide"
          lang="bn"
          aria-live="polite"
        >
          {error ? '' : quiz?.question?.native_string ? (showReadings ? renderQuestionWithReadings(quiz.question.native_string) : quiz.question.native_string) : (loading ? '読み込み中…' : '…')}
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-lg border border-[var(--danger)] text-[var(--danger)] bg-[color:rgb(239_68_68_/_0.06)]">{error}</div>
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
            <MapView name={correctCity.primary_answer} lat={correctCity.lat} lng={correctCity.lng} importance={correctCity.importance ?? 1} />
          </div>
        )}
      </section>
    </Layout>
  )
}
