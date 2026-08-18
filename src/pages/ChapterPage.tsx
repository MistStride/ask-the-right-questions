// 章节页：展示该章下的关卡列表与完成状态。
import { useNavigate, useParams } from 'react-router-dom'
import { CHAPTERS, ENGINE_BADGES } from '../content/chapters'
import { getLevelsByChapter } from '../content/levelIndex'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'

export default function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const locale = useSettingsStore((s) => s.locale)
  const completed = useProgressStore((s) => s.completed)

  const chapter = CHAPTERS.find((c) => c.id === Number(chapterId))
  if (!chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        {locale === 'zh' ? '章节不存在' : 'Chapter not found'}
      </div>
    )
  }

  const levels = getLevelsByChapter(chapter.id)
  const badge = chapter.engine ? ENGINE_BADGES[chapter.engine] : null
  const doneCount = levels.filter((l) => completed[l.meta.levelId]).length

  return (
    <div className="min-h-screen bg-abyss">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-600 transition hover:bg-panel-2 hover:text-slate-900"
        >
          ← {locale === 'zh' ? '返回地图' : 'Back'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-600 transition hover:bg-panel-2 hover:text-slate-900"
        >
          {locale === 'zh' ? '我的思维雷达' : 'My Radar'}
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-100 font-mono text-lg font-bold text-amber-700">
              {chapter.id}
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{chapter.title[locale]}</h1>
              <p className="text-xs text-slate-500">
                {locale === 'zh' ? '核心训练' : 'Focus'} · {chapter.focus[locale]}
              </p>
            </div>
          </div>
          {badge && (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-600/40 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
              {badge.icon} {badge[locale]}
            </span>
          )}
        </div>

        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {locale === 'zh' ? '关卡列表' : 'Levels'} · {doneCount}/{levels.length}
          </p>
          {levels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-slate-500">
              {locale === 'zh' ? '本章关卡正在开发中，敬请期待' : 'Levels for this chapter are in development'}
            </div>
          ) : (
            <div className="space-y-3">
              {levels.map((l, i) => {
                const rec = completed[l.meta.levelId]
                return (
                  <button
                    key={l.meta.levelId}
                    type="button"
                    onClick={() => navigate(`/level/${l.meta.levelId}`)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-panel p-4 text-left transition hover:border-amber-600/50 hover:shadow-[0_8px_24px_rgba(120,95,45,0.12)]"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                        rec
                          ? 'bg-gold text-white'
                          : 'border border-line bg-panel-2 text-slate-500 group-hover:text-amber-600'
                      }`}
                    >
                      {rec ? '★' : i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-slate-800">
                        {l.meta.levelId}
                        {l.meta.difficulty > 1 && (
                          <span className="ml-2 text-xs text-amber-400">
                            {'🔥'.repeat(l.meta.difficulty)}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {rec
                          ? locale === 'zh'
                            ? `已完成 · 还原度 ${rec.score}`
                            : `Done · accuracy ${rec.score}`
                          : locale === 'zh'
                            ? '未开始'
                            : 'Not started'}
                      </span>
                    </span>
                    <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-amber-600">
                      →
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 全部通关时：去下一章引导（避免用户卡在已通关章节） */}
        {doneCount === levels.length && levels.length > 0 && (() => {
          const currentIdx = CHAPTERS.findIndex((c) => c.id === chapter.id)
          const nextChapter = CHAPTERS[currentIdx + 1]
          return (
            <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-5 text-center">
              <p className="text-sm font-bold text-gold-deep">
                {locale === 'zh' ? '🎉 本章通关！' : '🎉 Chapter cleared!'}
              </p>
              {nextChapter ? (
                <>
                  <p className="mt-1 text-xs text-slate-600">
                    {locale === 'zh' ? '继续你的淘金之旅' : 'Keep panning'}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/chapter/${nextChapter.id}`)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(217,154,30,0.3)] transition hover:brightness-110"
                  >
                    {locale === 'zh' ? `下一章：第 ${nextChapter.id} 章` : `Next: Ch.${nextChapter.id}`} →
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-1 text-xs text-slate-600">
                    {locale === 'zh' ? '全书已通关，看看你的思维雷达' : 'All chapters cleared — check your radar'}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(217,154,30,0.3)] transition hover:brightness-110"
                  >
                    {locale === 'zh' ? '查看思维雷达 →' : 'View My Radar →'}
                  </button>
                </>
              )}
            </div>
          )
        })()}
      </main>
    </div>
  )
}
