// 首页：淘金路线图。13 章节点用矿脉串成一条横向路线，未解锁章节置灰。
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CHAPTERS, ENGINE_BADGES } from '../content/chapters'
import { LEVELS } from '../content/levelIndex'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'
import { RADAR_DIMENSIONS } from '../components/RadarChart'
import type { EngineType } from '../schema/levelTypes'

const DIMENSION_LABEL = {
  zh: { structure: '结构识别力', evidence: '证据鉴别力', assumption: '假设挖掘力', fallacy: '谬误免疫力', data: '数据免疫力', emotion: '情绪自控力' },
  en: { structure: 'Structure', evidence: 'Evidence', assumption: 'Assumption', fallacy: 'Fallacy', data: 'Data', emotion: 'Emotion' },
} as const

export default function HomePage() {
  const locale = useSettingsStore((s) => s.locale)
  const setLocale = useSettingsStore((s) => s.setLocale)
  const completed = useProgressStore((s) => s.completed)
  const radar = useProgressStore((s) => s.radar)
  const navigate = useNavigate()

  const playableChapterIds = new Set(LEVELS.map((l) => l.meta.chapter))
  const totalLevels = LEVELS.length
  const doneLevels = LEVELS.filter((l) => completed[l.meta.levelId]).length
  const allDone = doneLevels === totalLevels && totalLevels > 0

  // 下一个未通关关卡（按 LEVELS 顺序）
  const nextLevel = LEVELS.find((l) => !completed[l.meta.levelId])

  // 平均分（基于已通关）
  const scores = LEVELS
    .map((l) => completed[l.meta.levelId]?.score)
    .filter((s): s is number => typeof s === 'number')
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // 强势 / 弱势维度（仅在有进度时显示）
  const radarEntries = RADAR_DIMENSIONS.map((d) => [d.key, radar[d.key] ?? 0] as [string, number])
  const maxDim = allDone ? radarEntries[0] : radarEntries.reduce((a, b) => (a[1] >= b[1] ? a : b))
  const minDim = allDone ? radarEntries[5] : radarEntries.reduce((a, b) => (a[1] <= b[1] ? a : b))

  const t = {
    zh: {
      tag: '批判性思维 · 互动训练游戏',
      hero1: '别急着相信，',
      hero2: '先学会提问',
      desc: '把《学会提问》全书 13 章，变成一场淘金之旅。扫描论证、质询证据、校准灰度、拆除数据陷阱——用游戏的手感，练出淘金式思维。',
      cta: '开始淘金',
      nextTitle: '🎯 下一关',
      nextReady: allDone ? '🎉 全部通关' : '⛏ 下一关',
      nextHint: allDone
        ? '看看你的思维雷达，给淘金之旅画个句号'
        : '继续你的淘金之旅',
      nextCta: allDone ? '去思维雷达' : '开始这一关',
      reportTitle: '📊 你的思维报告',
      reportSub: `已打通 ${doneLevels}/${totalLevels} 关 · 平均还原度 ${avgScore}`,
      strengthLabel: '🏔 强势',
      weaknessLabel: '🎯 待补',
      reportCta: '查看完整雷达 →',
      emptyReport: '完成第一关后，你的思维报告会在这里生长',
      emptyReportCta: '去思维雷达 →',
      roadmap: '淘金路线图',
      roadmapSub: '13 个章节节点 · 5 套思维引擎',
      playable: '可玩',
      engineTitle: '思维引擎',
      engineDesc: '不是刷题，而是执行五组可复用的「思维动作」',
      progress: `已打通 ${doneLevels}/${totalLevels} 关`,
    },
    en: {
      tag: 'Critical thinking · interactive training games',
      hero1: "Don't just believe —",
      hero2: 'ask the right questions',
      desc: 'The 13 chapters of Asking the Right Questions, turned into a gold-panning journey. Scan arguments, cross-examine evidence, calibrate gray areas, defuse data traps — train critical thinking through gameplay.',
      cta: 'Start Panning',
      nextTitle: '🎯 Next level',
      nextReady: allDone ? '🎉 All cleared' : '⛏ Next level',
      nextHint: allDone
        ? 'See your thinking radar and close this journey'
        : 'Continue your gold-panning journey',
      nextCta: allDone ? 'Open My Radar' : 'Play this level',
      reportTitle: '📊 Your thinking report',
      reportSub: `${doneLevels}/${totalLevels} cleared · avg accuracy ${avgScore}`,
      strengthLabel: '🏔 Strength',
      weaknessLabel: '🎯 To grow',
      reportCta: 'Open full radar →',
      emptyReport: 'Your thinking report grows after your first clear',
      emptyReportCta: 'Open My Radar →',
      roadmap: 'The Gold Road',
      roadmapSub: '13 chapter nodes · 5 thinking engines',
      playable: 'Playable',
      engineTitle: 'Thinking Engines',
      engineDesc: 'Not quizzes — five reusable thinking moves',
      progress: `${doneLevels}/${totalLevels} levels cleared`,
    },
  }[locale]

  return (
    <div className="min-h-screen bg-abyss">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-30 border-b border-line/60 bg-abyss/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="text-xl">⛏</span>
            <span className="text-sm font-bold tracking-wide">
              {locale === 'zh' ? '学会提问' : 'Asking the Right Questions'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-amber-600/50 hover:text-amber-700"
            >
              🧭 {locale === 'zh' ? '我的思维雷达' : 'My Radar'}
            </button>
            <button
              type="button"
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-amber-600/50 hover:text-amber-700"
            >
              {locale === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-16 text-center">
          <span className="inline-block rounded-full border border-amber-500/40 bg-amber-100 px-3.5 py-1 text-xs font-medium tracking-wide text-amber-700">
            {t.tag}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight text-slate-800 sm:text-5xl">
            {t.hero1}
            <span className="block bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              {t.hero2}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {t.desc}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chapter/2')}
              className="rounded-xl bg-gold px-7 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(217,154,30,0.3)] transition hover:brightness-110"
            >
              {t.cta} →
            </motion.button>
            <span className="font-mono text-xs text-slate-500">{t.progress}</span>
          </div>

          {/* 下一关 + 思维报告（替换原"海绵 vs 淘金"概念框——有真实内容、可点击） */}
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            {/* 卡 1：下一关 / 全部通关 */}
            <button
              type="button"
              onClick={() => {
                if (nextLevel) navigate(`/level/${nextLevel.meta.levelId}`)
                else navigate('/profile')
              }}
              className="group flex flex-col rounded-2xl border border-amber-500/50 bg-amber-50 p-4 text-left transition hover:border-amber-500 hover:shadow-[0_8px_24px_rgba(217,154,30,0.15)]"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{t.nextTitle}</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{t.nextReady}</p>
              {nextLevel && (() => {
                const ch = CHAPTERS.find((c) => c.id === nextLevel.meta.chapter)
                const badge = ch?.engine ? ENGINE_BADGES[ch.engine] : null
                return (
                  <p className="mt-1 text-xs text-slate-600">
                    {locale === 'zh'
                      ? `第 ${ch?.id} 章 · ${badge?.icon ?? ''} ${badge?.zh ?? ''}`
                      : `Ch.${ch?.id} · ${badge?.icon ?? ''} ${badge?.en ?? ''}`}
                  </p>
                )
              })()}
              <p className="mt-1.5 text-[11px] text-slate-500">{t.nextHint}</p>
              <p className="mt-2 text-xs font-semibold text-amber-700 transition group-hover:translate-x-1">
                {t.nextCta} →
              </p>
            </button>

            {/* 卡 2：思维报告（已有进度时显示强弱维度；全空时提示去雷达） */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="group flex flex-col rounded-2xl border border-line bg-white p-4 text-left transition hover:border-cyan-600/50 hover:shadow-[0_8px_24px_rgba(14,116,144,0.12)]"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.reportTitle}</p>
              {doneLevels > 0 ? (
                <>
                  <p className="mt-2 text-sm font-bold text-slate-800">{t.reportSub}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                    <span className="text-emerald-600 font-semibold">{t.strengthLabel}</span> {DIMENSION_LABEL[locale][maxDim[0] as keyof typeof DIMENSION_LABEL.zh]} {maxDim[1]}
                    <br />
                    <span className="text-amber-600 font-semibold">{t.weaknessLabel}</span> {DIMENSION_LABEL[locale][minDim[0] as keyof typeof DIMENSION_LABEL.zh]} {minDim[1]}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-cyan-700 transition group-hover:translate-x-1">
                    {t.reportCta}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.emptyReport}</p>
                  <p className="mt-2 text-xs font-semibold text-cyan-700 transition group-hover:translate-x-1">
                    {t.emptyReportCta}
                  </p>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 淘金路线图 */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-center text-lg font-bold text-slate-800">🗺️ {t.roadmap}</h2>
        <p className="mt-1 text-center text-xs text-slate-500">{t.roadmapSub}</p>

        <div className="scroll-thin mt-6 flex gap-3 overflow-x-auto pb-3">
          {CHAPTERS.map((c, i) => {
            const isPlayable = playableChapterIds.has(c.id)
            const isDone = LEVELS.some(
              (l) => l.meta.chapter === c.id && completed[l.meta.levelId],
            )
            const badge = c.engine ? ENGINE_BADGES[c.engine] : null
            return (
              <div key={c.id} className="flex shrink-0 items-center">
                {i > 0 && <span className="mx-1 h-px w-6 bg-line" />}
                <motion.button
                  type="button"
                  disabled={!isPlayable}
                  whileHover={isPlayable ? { y: -4 } : undefined}
                  onClick={() => navigate(`/chapter/${c.id}`)}
                  className={`relative w-44 rounded-2xl border p-4 text-left transition ${
                    isPlayable
                      ? isDone
                        ? 'border-gold/60 bg-gold/10'
                        : 'border-gold/35 bg-panel hover:border-gold/70'
                      : 'border-line bg-white/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-amber-600">
                      {String(c.id).padStart(2, '0')}
                    </span>
                    {isPlayable ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isDone
                            ? 'bg-gold text-white'
                            : 'border border-cyan-600/40 bg-cyan-50 text-cyan-700'
                        }`}
                      >
                        {isDone ? '★' : t.playable}
                      </span>
                    ) : (
                      <span className="text-slate-600">🔒</span>
                    )}
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-xs font-semibold leading-snug text-slate-800">
                    {c.title[locale]}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{c.focus[locale]}</p>
                  {badge && (
                    <p className="mt-2 text-[10px] text-slate-500">
                      {badge.icon} {badge[locale]}
                    </p>
                  )}
                </motion.button>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-600">
          {locale === 'zh'
            ? `${CHAPTERS.length} 章 · ${totalLevels} 关 · 5 套思维引擎，全部开放，按章节顺序通关`
            : `${CHAPTERS.length} chapters · ${totalLevels} levels · 5 thinking engines — all open, play in order`}
        </p>
      </section>

      {/* 五引擎 */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-center text-lg font-bold text-slate-800">🧩 {t.engineTitle}</h2>
        <p className="mt-1 text-center text-xs text-slate-500">{t.engineDesc}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              ['xray', '🔍', 'cyan'],
              ['courtroom', '⚖️', 'rose'],
              ['scale', '⚗️', 'violet'],
              ['defusal', '🧨', 'orange'],
              ['tamer', '🐘', 'gold'],
            ] as [EngineType, string, string][]
          ).map(([engine, icon]) => {
            const b = ENGINE_BADGES[engine]
            const actives = LEVELS.filter((l) => l.meta.engine === engine)
            return (
              <div
                key={engine}
                className="rounded-2xl border border-line bg-panel p-4 text-center"
              >
                <span className="text-2xl">{icon}</span>
                <p className="mt-2 text-sm font-semibold text-slate-200">{b[locale]}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {locale === 'zh'
                    ? `${actives.length} 个关卡已上线`
                    : `${actives.length} level(s) live`}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="border-t border-line/60 py-6 text-center text-xs text-slate-500">
        ⛏ Asking the Right Questions · based on Neil Browne &amp; Stuart Keeley's book ·{' '}
        {locale === 'zh' ? '内容驱动 · 欢迎贡献关卡' : 'data-driven · level contributions welcome'}
      </footer>
    </div>
  )
}
