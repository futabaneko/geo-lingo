import GuideTable from '../../components/GuideTable'
import { getGuideData } from '../../lib/guide/bengali'

export default function BengaliGuide(){
  const g = getGuideData()
  return (
    <>
      <section className="mt-4">
        <h3 className="font-semibold mb-2">まずはここから（最小セット）</h3>
        <p className="text-[var(--muted)] mb-2">この3分セットで「見てわかる」状態に。母音記号と頻出子音だけを先に押さえましょう。</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-medium mb-1">母音記号（子音に付く）</h4>
            <GuideTable rows={g.vowelSigns} headers={["記号","読み（ラフ）","例"]} />
          </div>
          <div>
            <h4 className="font-medium mb-1">頻出子音</h4>
            <GuideTable rows={g.consonants} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="font-semibold mb-2">独立母音（余裕があれば）</h3>
        <GuideTable rows={g.vowels} />
      </section>

      <section className="mt-6">
        <h3 className="font-semibold mb-2">地名でよくある語尾・要素</h3>
        <ul className="list-disc pl-5 space-y-1">
          {g.suffixNotes.map((t, i) => (<li key={i} dangerouslySetInnerHTML={{__html: t}} />))}
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="font-semibold mb-2">表記ゆれの代表例</h3>
        <ul className="list-disc pl-5 space-y-1">
          {g.variants.map((t, i) => (<li key={i}>{t}</li>))}
        </ul>
      </section>
    </>
  )
}
