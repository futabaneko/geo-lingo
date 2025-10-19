(() => {
  const KEY = 'geo-lingo-theme'
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const initial = localStorage.getItem(KEY) || (prefersDark ? 'dark' : 'light')
  document.documentElement.setAttribute('data-theme', initial)
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    const next = cur === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem(KEY, next) } catch {}
  })
})()
