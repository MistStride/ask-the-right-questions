// 我的思维雷达 —— 六维雷达图（阶段 3）+ 已完成关卡列表（阶段 7 将再加分享卡）
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'
import { LEVELS } from '../content/levelIndex'
import { CHAPTERS } from '../content/chapters'
import RadarChart from '../components/RadarChart'

export default function ProfilePage() {
  const navigate = useNavigate()
  const locale = useSettingsStore((s) => s.locale)
  const { completed, radar } = useProgressStore()
  const completedIds = Object.keys(completed)
  const doneCount = completedIds.length

  return (
    <div className="min-h-screen bg-abyss">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-400 transition hover:bg-panel-2 hover:text-slate-700"
        >
          ← {locale === 'zh' ? '返回地图' : 'Back'}
        </button>
        <span className="text-sm font-bold tracking-wide text-amber-700">
          {locale === 'zh' ? '我的思维雷达' : 'My Thinking Radar'}
        </span>
        <span className="w-20" />
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        {/* 六维雷达图 */}
        <section className="rounded-2xl border border-line bg-panel p-5 shadow-[0_1px_8px_rgba(190,172,132,0.14)]">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              🧭 {locale === 'zh' ? '六维思维雷达' : 'Six-dimension Radar'}
            </h2>
            <span className="font-mono text-xs text-gold">
              {doneCount}/{LEVELS.length} {locale === 'zh' ? '关' : 'levels'}
            </span>
          </div>
          <div className="mt-3">
            <RadarChart values={radar} locale={locale} />
          </div>
        </section>

        {/* 已完成关卡 */}
        <section className="mt-4 rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-sm font-semibold text-slate-800">
            {locale === 'zh' ? '已完成关卡' : 'Completed levels'}{' '}
            <span className="font-mono text-gold">({doneCount}/{LEVELS.length})</span>
          </h2>
          <div className="mt-4 space-y-2">
            {LEVELS.map((l) => {
              const rec = completed[l.meta.levelId]
              const chapter = CHAPTERS.find((c) => c.id === l.meta.chapter)
              return (
                <button
                  key={l.meta.levelId}
                  type="button"
                  onClick={() => navigate(`/level/${l.meta.levelId}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 text-left transition hover:border-amber-600/40"
                >
                  <span className={rec ? 'text-amber-600' : 'text-slate-400'}>
                    {rec ? '★' : '☆'}
                  </span>
                  <span className="flex-1 truncate text-sm text-slate-700">
                    {locale === 'zh' ? `第${l.meta.chapter}章` : `Ch.${l.meta.chapter}`}{' '}
                    {chapter?.title[locale]}
                  </span>
                  {rec && (
                    <span className="font-mono text-xs text-cyan-700">{rec.score}</span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
