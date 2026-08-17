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
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-400 transition hover:bg-panel-2 hover:text-slate-200"
        >
          ← {locale === 'zh' ? '返回地图' : 'Back'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-400 transition hover:bg-panel-2 hover:text-slate-200"
        >
          {locale === 'zh' ? '我的思维雷达' : 'My Radar'}
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 font-mono text-lg font-bold text-gold">
              {chapter.id}
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-100">{chapter.title[locale]}</h1>
              <p className="text-xs text-slate-500">
                {locale === 'zh' ? '核心训练' : 'Focus'} · {chapter.focus[locale]}
              </p>
            </div>
          </div>
          {badge && (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
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
                    className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-panel p-4 text-left transition hover:border-gold/50 hover:shadow-[0_0_24px_rgba(245,185,66,0.08)]"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                        rec
                          ? 'bg-gold text-abyss'
                          : 'border border-line bg-panel-2 text-slate-400 group-hover:text-gold'
                      }`}
                    >
                      {rec ? '★' : i + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-slate-200">
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
                    <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-gold">
                      →
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
