// 首页：淘金路线图。13 章节点用矿脉串成一条横向路线，未解锁章节置灰。
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CHAPTERS, ENGINE_BADGES } from '../content/chapters'
import { LEVELS } from '../content/levelIndex'
import { useSettingsStore } from '../store/settingsStore'
import { useProgressStore } from '../store/progressStore'
import type { EngineType } from '../schema/levelTypes'

export default function HomePage() {
  const locale = useSettingsStore((s) => s.locale)
  const setLocale = useSettingsStore((s) => s.setLocale)
  const completed = useProgressStore((s) => s.completed)
  const navigate = useNavigate()

  const playableChapterIds = new Set(LEVELS.map((l) => l.meta.chapter))
  const totalLevels = LEVELS.length
  const doneLevels = LEVELS.filter((l) => completed[l.meta.levelId]).length

  const t = {
    zh: {
      tag: '批判性思维 · 互动训练游戏',
      hero1: '别急着相信，',
      hero2: '先学会提问',
      desc: '把《学会提问》全书 13 章，变成一场淘金之旅。扫描论证、质询证据、校准灰度、拆除数据陷阱——用游戏的手感，练出淘金式思维。',
      cta: '开始淘金',
      roadmap: '淘金路线图',
      roadmapSub: '13 个章节节点 · 5 套思维引擎',
      playable: '可玩',
      coming: '即将到来',
      engineTitle: '思维引擎',
      engineDesc: '不是刷题，而是执行五组可复用的「思维动作」',
      progress: `已打通 ${doneLevels}/${totalLevels} 关`,
      golden: '淘金式思维',
      sponge: '海绵式思维',
      goldenDesc: '主动提问、筛选信息、评估论证，把金子从沙里淘出来',
      spongeDesc: '被动吸收所有信息，像海绵一样全盘接受',
    },
    en: {
      tag: 'Critical thinking · interactive training games',
      hero1: "Don't just believe —",
      hero2: 'ask the right questions',
      desc: 'The 13 chapters of Asking the Right Questions, turned into a gold-panning journey. Scan arguments, cross-examine evidence, calibrate gray areas, defuse data traps — train critical thinking through gameplay.',
      cta: 'Start Panning',
      roadmap: 'The Gold Road',
      roadmapSub: '13 chapter nodes · 5 thinking engines',
      playable: 'Playable',
      coming: 'Coming soon',
      engineTitle: 'Thinking Engines',
      engineDesc: 'Not quizzes — five reusable thinking moves',
      progress: `${doneLevels}/${totalLevels} levels cleared`,
      golden: 'Panning-for-Gold',
      sponge: 'Sponge thinking',
      goldenDesc: 'Ask actively, filter information, evaluate arguments — pan the gold out of the sand',
      spongeDesc: 'Soak up everything passively, accept it all',
    },
  }[locale]

  return (
    <div className="min-h-screen bg-abyss">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-30 border-b border-line/60 bg-abyss/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-xl">⛏</span>
            <span className="text-sm font-bold tracking-wide">
              {locale === 'zh' ? '学会提问' : 'Asking the Right Questions'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-gold/50 hover:text-gold"
            >
              🧭 {locale === 'zh' ? '我的思维雷达' : 'My Radar'}
            </button>
            <button
              type="button"
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-gold/50 hover:text-gold"
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
          <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-xs font-medium tracking-wide text-amber-300">
            {t.tag}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight text-slate-100 sm:text-5xl">
            {t.hero1}
            <span className="block bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
              {t.hero2}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            {t.desc}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chapter/2')}
              className="rounded-xl bg-gold px-7 py-3 text-sm font-bold text-abyss shadow-[0_0_32px_rgba(245,185,66,0.35)] transition hover:brightness-110"
            >
              {t.cta} →
            </motion.button>
            <span className="font-mono text-xs text-slate-500">{t.progress}</span>
          </div>

          {/* 海绵 vs 淘金 */}
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-500/30 bg-panel/60 p-4 opacity-80">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                🧽 {t.sponge}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{t.spongeDesc}</p>
            </div>
            <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 shadow-[0_0_24px_rgba(245,185,66,0.08)]">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">⛏ {t.golden}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{t.goldenDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 淘金路线图 */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-center text-lg font-bold text-slate-200">🗺️ {t.roadmap}</h2>
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
                      : 'border-line bg-panel/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-gold/80">
                      {String(c.id).padStart(2, '0')}
                    </span>
                    {isPlayable ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isDone
                            ? 'bg-gold text-abyss'
                            : 'border border-cyan-400/50 text-cyan-300'
                        }`}
                      >
                        {isDone ? '★' : t.playable}
                      </span>
                    ) : (
                      <span className="text-slate-600">🔒</span>
                    )}
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-xs font-semibold leading-snug text-slate-200">
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
            ? '路线图按章节顺序延伸，目前第 2 章可玩，其余章节正在按同一套引擎架构开发中'
            : 'Chapters unlock in order — Ch.2 is playable now, more engines are being built on the same architecture'}
        </p>
      </section>

      {/* 五引擎 */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-center text-lg font-bold text-slate-200">🧩 {t.engineTitle}</h2>
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
                  {actives.length > 0
                    ? locale === 'zh'
                      ? `${actives.length} 个关卡已上线`
                      : `${actives.length} level(s) live`
                    : locale === 'zh'
                      ? '开发中'
                      : 'In development'}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="border-t border-line/60 py-6 text-center text-xs text-slate-600">
        ⛏ Asking the Right Questions · based on Neil Browne &amp; Stuart Keeley's book ·{' '}
        {locale === 'zh' ? '内容驱动 · 欢迎贡献关卡' : 'data-driven · level contributions welcome'}
      </footer>
    </div>
  )
}
