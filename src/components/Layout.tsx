import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../lib/useTheme'

export default function Layout({ children }: { children: React.ReactNode }){
  const { toggle } = useTheme()
  const [open, setOpen] = useState(false)

  const navLinkBase = 'px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)] hover:underline'
  const navLinkActive = 'text-[var(--text)] border-[var(--primary)]'

  return (
    <div className="min-h-svh bg-[var(--bg)] text-[var(--text)]">
      {/* Header */}
      <header className="max-w-3xl mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">Geo-Lingo</Link>
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink to="/" end className={({isActive}) => `${navLinkBase} ${isActive ? navLinkActive : ''}`}>ホーム</NavLink>
          <NavLink to="/guide" className={({isActive}) => `${navLinkBase} ${isActive ? navLinkActive : ''}`}>ガイド</NavLink>
          <a href="https://www.geoguessr.com/" target="_blank" rel="noopener noreferrer" className={navLinkBase}>Geoguessr</a>
          <button onClick={toggle} className="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card)]">🌓</button>
        </nav>
        <button onClick={() => setOpen(true)} className="sm:hidden px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card)]" aria-label="メニューを開く">☰</button>
      </header>

      {/* Sidebar (Drawer) */}
      <div className={`fixed inset-0 z-40 ${open ? 'block' : 'hidden'}`} aria-hidden={!open}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <aside className="absolute top-0 right-0 h-full w-72 bg-[var(--card)] border-l border-[var(--border)] shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">メニュー</span>
            <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--bg)]">✕</button>
          </div>
          <nav className="flex flex-col gap-2">
            <NavLink onClick={()=>setOpen(false)} to="/" end className={({isActive}) => `${navLinkBase} ${isActive ? navLinkActive : ''}`}>ホーム</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/guide" className={({isActive}) => `${navLinkBase} ${isActive ? navLinkActive : ''}`}>ガイド</NavLink>
            <a className={navLinkBase} href="https://www.geoguessr.com/" target="_blank" rel="noopener noreferrer">Geoguessr</a>
            <button onClick={()=>{toggle();}} className="mt-2 px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-left">テーマ切替 🌓</button>
          </nav>
        </aside>
      </div>

      {/* Main */}
      <main className="max-w-3xl mx-auto p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto p-4 flex items-center justify-between">
        <small>© 2025 Geo-Lingo MVP</small>
      </footer>
    </div>
  )
}
