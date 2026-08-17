// 通关结算弹窗：所有引擎共用。展示深度解析 + 雷达维度奖励 + 操作按钮。
import { motion } from 'framer-motion'
import type { Locale, RadarDimension } from '../schema/levelTypes'

const TAG_LABELS: Record<RadarDimension, { zh: string; en: string }> = {
  structure: { zh: '结构识别力', en: 'Structure' },
  evidence: { zh: '证据鉴别力', en: 'Evidence' },
  assumption: { zh: '假设挖掘力', en: 'Assumption' },
  fallacy: { zh: '谬误免疫力', en: 'Fallacy' },
  data: { zh: '数据免疫力', en: 'Data' },
  emotion: { zh: '情绪自控力', en: 'Emotion' },
}

interface Props {
  open: boolean
  levelTitle: string
  score: number
  rewardTags: RadarDimension[]
  explanation: string
  contributor?: string
  hasNext: boolean
  onNext: () => void
  onHome: () => void
  onReplay: () => void
  locale: Locale
}

const LABELS = {
  zh: {
    complete: '论证结构已还原！',
    sub: '你成功用透视镜扫出了这段论证的骨架',
    scoreLabel: '还原度',
    explain: '深度解析',
    next: '下一关 →',
    home: '返回地图',
    replay: '再玩一次',
    badge: '雷达维度 +',
    contributor: '关卡贡献者',
  },
  en: {
    complete: 'Argument structure restored!',
    sub: 'You scanned the skeleton of this argument',
    scoreLabel: 'Accuracy',
    explain: 'Deep Dive',
    next: 'Next Level →',
    home: 'Back to Map',
    replay: 'Play Again',
    badge: 'Radar +',
    contributor: 'Level by',
  },
}

export default function LevelCompleteModal({
  open,
  levelTitle,
  score,
  rewardTags,
  explanation,
  contributor,
  hasNext,
  onNext,
  onHome,
  onReplay,
  locale,
}: Props) {
  if (!open) return null
  const t = LABELS[locale]

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gold/40 bg-panel shadow-[0_0_60px_rgba(245,185,66,0.15)]"
      >
        {/* 顶部金色光芒 */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gold/10 blur-3xl" />

        <div className="relative p-6 sm:p-7">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-bold tracking-wide">{t.complete}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">{t.sub}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {levelTitle}
          </p>

          {/* 分数 + 雷达维度 */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2">
              <span className="text-xs text-cyan-300">{t.scoreLabel}</span>
              <span className="font-mono text-2xl font-bold text-cyan-300">{score}</span>
              <span className="text-xs text-cyan-500">/100</span>
            </div>
            {rewardTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-amber-300"
              >
                {t.badge} {TAG_LABELS[tag][locale]}
              </span>
            ))}
          </div>

          {/* 深度解析 */}
          <div className="mt-4 rounded-xl border border-line bg-panel-2 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {t.explain}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{explanation}</p>
          </div>

          {contributor && (
            <p className="mt-3 text-right text-xs text-slate-600">
              {t.contributor} · {contributor}
            </p>
          )}

          {/* 操作 */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {hasNext ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110"
              >
                {locale === 'zh' ? '下一关 →' : 'Next Level →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onHome}
                className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-abyss shadow-[0_0_20px_rgba(245,185,66,0.4)] transition hover:brightness-110"
              >
                🎉 {locale === 'zh' ? '全部通关' : 'All Cleared'}
              </button>
            )}
            <button
              type="button"
              onClick={onReplay}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-panel-2"
            >
              {t.replay}
            </button>
            {hasNext && (
              <button
                type="button"
                onClick={onHome}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-panel-2"
              >
                {t.home}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
