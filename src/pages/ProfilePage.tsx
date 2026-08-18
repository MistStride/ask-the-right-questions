// 我的思维雷达 —— 六维雷达图 + 战绩分享卡（阶段 7）
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'
import { LEVELS } from '../content/levelIndex'
import { CHAPTERS } from '../content/chapters'
import RadarChart, { RADAR_DIMENSIONS } from '../components/RadarChart'
import ShareCard from '../components/ShareCard'
import type { RadarDimension } from '../schema/levelTypes'

export default function ProfilePage() {
  const navigate = useNavigate()
  const locale = useSettingsStore((s) => s.locale)
  const { completed, radar } = useProgressStore()
  const completedIds = Object.keys(completed)
  const doneCount = completedIds.length
  const total = LEVELS.length
  const [exporting, setExporting] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  // 平均还原度（已通关）
  const scores = LEVELS.map((l) => completed[l.meta.levelId]?.score).filter(
    (s): s is number => typeof s === 'number',
  )
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // 强/弱维度
  const entries = RADAR_DIMENSIONS.map(
    (d) => [d.key, radar[d.key] ?? 0] as [RadarDimension, number],
  )
  const maxDim = entries.reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
  const minDim = entries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0]

  const handleShare = async () => {
    if (!shareRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#171310',
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `atrq-thinking-report-${Date.now()}.png`
      a.click()
    } catch (e) {
      console.error('分享卡生成失败:', e)
    } finally {
      setExporting(false)
    }
  }

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

        {/* 战绩分享卡（阶段 7）：有进度时展示预览 + 生成按钮 */}
        {doneCount > 0 && (
          <section className="mt-4 rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                📤 {locale === 'zh' ? '我的思维诊断报告' : 'My Thinking Report'}
              </h2>
              <button
                type="button"
                onClick={handleShare}
                disabled={exporting}
                className="rounded-xl bg-gold px-4 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(217,154,30,0.3)] transition hover:brightness-110 disabled:opacity-60"
              >
                {exporting
                  ? locale === 'zh'
                    ? '生成中…'
                    : 'Rendering…'
                  : locale === 'zh'
                    ? '⬇️ 生成分享卡'
                    : '⬇️ Share card'}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              {locale === 'zh'
                ? '生成高清图片，可保存发小红书 / 朋友圈 / X'
                : 'Generates a hi-res image — save & share on 小红书 / Moments / X'}
            </p>
            <div className="mt-4 flex justify-center">
              <div ref={shareRef}>
                <ShareCard
                  values={radar}
                  doneCount={doneCount}
                  total={total}
                  avgScore={avgScore}
                  maxDim={maxDim}
                  minDim={minDim}
                  locale={locale}
                />
              </div>
            </div>
          </section>
        )}

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
