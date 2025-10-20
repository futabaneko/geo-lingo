import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import GuideIndex from './pages/GuideIndex'
import LanguageQuiz from './pages/LanguageQuiz'
import LanguageGuide from './pages/LanguageGuide'
import Changelog from './pages/Changelog'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Guides landing */}
        <Route path="/guide" element={<GuideIndex />} />
  {/* Changelog */}
  <Route path="/changelog" element={<Changelog />} />
        {/* language-scoped routes */}
        <Route path=":lang" element={<LanguageQuiz />} />
        <Route path=":lang/guide" element={<LanguageGuide />} />
        {/* legacy paths (redirect-ish) */}
        <Route path="bengali-guide" element={<LanguageGuide />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)

