type Row = [glyph: string, reading: string, example?: string]

export default function GuideTable({ rows, headers = ['文字','読み（ラフ）','例'] }: { rows: Row[]; headers?: [string,string,string] }){
  return (
    <div className="overflow-auto border border-[var(--border)] rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-[var(--bg)] text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2 text-left">{headers[0]}</th>
            <th className="px-3 py-2 text-left">{headers[1]}</th>
            <th className="px-3 py-2 text-left">{headers[2]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-[color:rgb(0_0_0_/_0.02)]">
              <td className="px-3 py-2" style={{fontFamily:'Noto Sans Bengali'}}>{row[0]}</td>
              <td className="px-3 py-2">{row[1]}</td>
              <td className="px-3 py-2 text-[var(--muted)]" style={{fontFamily:'Noto Sans Bengali'}}>{row[2] ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
