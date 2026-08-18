import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChapterPage from './pages/ChapterPage'
import LevelPage from './pages/LevelPage'
import ProfilePage from './pages/ProfilePage'
import FeedbackToast from './components/FeedbackToast'

export default function App() {
  return (
    // HashRouter：静态托管（GitHub Pages 等）无 SPA fallback，
    // hash 路由可让刷新/直达子路由 100% 可用，URL 形如 /#/level/ch07-level01
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chapter/:chapterId" element={<ChapterPage />} />
        <Route path="/level/:levelId" element={<LevelPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      {/* 全局反馈弹层：所有引擎共用 */}
      <FeedbackToast />
    </HashRouter>
  )
}
