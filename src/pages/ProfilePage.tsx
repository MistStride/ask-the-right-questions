// 我的思维雷达（阶段 7 将升级为六维雷达图 + 分享卡；当前展示已完成关卡与维度进度条）
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'
import { LEVELS } from '../content/levelIndex'
import { CHAPTERS } from '../content/chapters'
import type { RadarDimension } from '../schema/levelTypes'

const DIMENSIONS: { key: RadarDimension; zh: string; en: string; icon: string }[] = [
  { key: 'structure', zh: '结构识别力', en: 'Structure', icon: '🧱' },
  { key: 'evidence', zh: '证据鉴别力', en: 'Evidence', icon: '🔎' },
  { key: 'assumption', zh: '假设挖掘力', en: 'Assumption', icon: '⛏️' },
  { key: 'fallacy', zh: '谬误免疫力', en: 'Fallacy', icon: '🛡️' },
  { key: 'data', zh: '数据免疫力', en: 'Data', icon: '🧮' },
  { key: 'emotion', zh: '情绪自控力', en: 'Emotion', icon: '🐘' },
]

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
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-slate-400 transition hover:bg-panel-2 hover:text-slate-200"
        >
          ← {locale === 'zh' ? '返回地图' : 'Back'}
        </button>
        <span className="text-sm font-bold tracking-wide text-gold">
          {locale === 'zh' ? '我的思维雷达' : 'My Thinking Radar'}
        </span>
        <span className="w-20" />
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 维度进度 */}
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-sm font-semibold text-slate-200">
              {locale === 'zh' ? '六维思维成长' : 'Six-dimension growth'}
            </h2>
            <div className="mt-4 space-y-3">
              {DIMENSIONS.map((d) => (
                <div key={d.key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-400">
                      {d.icon} {d[locale]}
                    </span>
                    <span className="font-mono text-slate-300">{Math.round(radar[d.key])}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-amber-500"
                      style={{ width: `${radar[d.key]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {locale === 'zh' ? '通关关卡点亮对应维度 · 雷达图即将到来' : 'Clear levels to light up dimensions · radar chart coming soon'}
            </p>
          </section>

          {/* 已完成关卡 */}
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-sm font-semibold text-slate-200">
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
                    className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 text-left transition hover:border-gold/40"
                  >
                    <span className={rec ? 'text-gold' : 'text-slate-600'}>
                      {rec ? '★' : '☆'}
                    </span>
                    <span className="flex-1 truncate text-sm text-slate-300">
                      {locale === 'zh' ? `第${l.meta.chapter}章` : `Ch.${l.meta.chapter}`}{' '}
                      {chapter?.title[locale]}
                    </span>
                    {rec && (
                      <span className="font-mono text-xs text-cyan-300">{rec.score}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
