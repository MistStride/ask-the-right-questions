// 结算"每步判定"复盘面板：5 引擎共用，按 kind 分发渲染。
// 默认折叠，点 "📝 查看本关每步判定" 展开。
import { useState } from 'react'
import type { Locale } from '../schema/levelTypes'
import {
  STATUS_DOT,
  type StepReviewItem,
} from '../schema/stepReview'

interface Props {
  review: StepReviewItem
  locale: Locale
}

const T = {
  zh: {
    toggleOpen: '📝 查看本关每步判定',
    toggleClose: '收起复盘',
    emptyTries: '（没有试错记录，一次到位）',
    idealRange: '合理区间',
    idealPoint: '最佳点',
    final: '最终',
    traps: '陷阱',
    decoys: '次假陷阱干扰',
    events: '冲动',
    wrongs: '偏题',
    nearMiss: '近失误',
    steps: '步骤',
    wrongClicks: '干扰/顺序错点击',
    noWrong: '（没有错点）',
    position: '位置',
    precision: '精度',
    inRange: '在区间内',
    outOfRange: '出区间',
    left: '偏左',
    right: '偏右',
    found: '已找到',
    missed: '未找到',
  },
  en: {
    toggleOpen: '📝 Step-by-step review',
    toggleClose: 'Hide review',
    emptyTries: '(no false tries — clean pass)',
    idealRange: 'Ideal range',
    idealPoint: 'Best point',
    final: 'Final',
    traps: 'Traps',
    decoys: 'decoy taps',
    events: 'Impulses',
    wrongs: 'misses',
    nearMiss: 'near-misses',
    steps: 'Steps',
    wrongClicks: 'Distractor / out-of-order clicks',
    noWrong: '(no wrong clicks)',
    position: 'pos',
    precision: 'precision',
    inRange: 'in range',
    outOfRange: 'out of range',
    left: 'left',
    right: 'right',
    found: 'found',
    missed: 'missed',
  },
} as const

const badge = (zh: string, en: string, locale: Locale) => (locale === 'zh' ? zh : en)

export default function StepReviewPanel({ review, locale }: Props) {
  const [open, setOpen] = useState(false)
  const t = T[locale]

  return (
    <div className="mt-4 rounded-xl border border-line bg-panel-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-panel"
      >
        <span>{open ? t.toggleClose : t.toggleOpen}</span>
        <span className="text-slate-400">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="border-t border-line p-4 text-sm leading-relaxed text-slate-700">
          {review.kind === 'xray' && <XraySection review={review} locale={locale} t={t} />}
          {review.kind === 'courtroom' && <CourtroomSection review={review} locale={locale} t={t} />}
          {review.kind === 'scale' && <ScaleSection review={review} locale={locale} t={t} />}
          {review.kind === 'defusal' && <DefusalSection review={review} locale={locale} t={t} />}
          {review.kind === 'tamer' && <TamerSection review={review} locale={locale} t={t} />}
        </div>
      )}
    </div>
  )
}

/* ---------------- X-Ray ---------------- */
function XraySection({
  review,
  locale,
  t,
}: {
  review: Extract<StepReviewItem, { kind: 'xray' }>
  locale: Locale
  t: (typeof T)[Locale]
}) {
  return (
    <div className="space-y-3">
      <SummaryLine
        primary={`${badge('找到', 'Found', locale)} ${review.summary.foundCount}/${review.summary.total}`}
        secondary={
          review.summary.mistakes > 0
            ? `${badge('错点', 'wrong clicks', locale)} ${review.summary.mistakes}`
            : badge('零错点', 'no wrong clicks', locale)
        }
        locale={locale}
      />
      <ol className="space-y-2">
        {review.items.map((it) => (
          <li key={it.stepIdx} className="rounded-lg border border-line bg-white/60 p-3">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              <span>{badge('步骤', 'Step', locale)} {it.stepIdx + 1}</span>
              <span className="text-slate-400">·</span>
              <span>{it.stepLabel}</span>
            </div>
            <ul className="space-y-1">
              {it.targetDescs.map((t2) => {
                const ok = it.foundIds.includes(t2.id)
                return (
                  <li key={t2.id} className="flex items-start gap-2">
                    <span className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={ok ? 'text-slate-700' : 'text-slate-400 line-through'}>
                      {t2.text}
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-400">
                        {ok ? badge('已找到', 'found', locale) : badge('未找到', 'missed', locale)}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>
      {review.wrongClicks.length > 0 && (
        <div className="rounded-lg border border-red-300/50 bg-red-50/60 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-red-600">
            {t.wrongClicks}
          </p>
          <ul className="space-y-1">
            {review.wrongClicks.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  {w.text}
                  <span className="ml-2 text-[10px] text-slate-400">{w.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ---------------- Courtroom ---------------- */
function CourtroomSection({
  review,
  locale,
  t,
}: {
  review: Extract<StepReviewItem, { kind: 'courtroom' }>
  locale: Locale
  t: (typeof T)[Locale]
}) {
  return (
    <div className="space-y-3">
      <SummaryLine
        primary={`${badge('击碎', 'Shattered', locale)} ${review.summary.hitCount}/${review.summary.total}`}
        secondary={`${review.summary.wrongTries} ${t.wrongs} · ${review.summary.nearMissTries} ${t.nearMiss}`}
        locale={locale}
      />
      <ol className="space-y-2">
        {review.items.map((it) => (
          <li key={it.spotId} className="rounded-lg border border-line bg-white/60 p-3">
            <div className="flex items-start gap-2">
              <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[it.status]}`} />
              <div className="flex-1">
                <p className="text-sm text-slate-800">"{it.anchorText}"</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {badge('破绽', 'issue', locale)}: {it.issueType}
                  {it.status === 'hit' && it.hitByText && (
                    <> · {badge('命中', 'hit by', locale)}: <span className="text-amber-700">「{it.hitByText}」</span></>
                  )}
                  {it.wrongTries + it.nearMissTries > 0 && (
                    <> · {it.wrongTries} {t.wrongs} / {it.nearMissTries} {t.nearMiss}</>
                  )}
                </p>
                <p className="mt-1 rounded border border-amber-300/50 bg-amber-50/60 px-2 py-1 text-xs text-amber-900">
                  💡 {it.debunkText}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---------------- Scale ---------------- */
function ScaleSection({
  review,
  locale,
  t,
}: {
  review: Extract<StepReviewItem, { kind: 'scale' }>
  locale: Locale
  t: (typeof T)[Locale]
}) {
  return (
    <div className="space-y-3">
      <SummaryLine
        primary={`${t.final}: ${review.bestScore}`}
        secondary={
          review.finalInRange
            ? `✓ ${t.inRange} · ${t.idealRange} [${review.idealRange[0]}, ${review.idealRange[1]}] · ${t.idealPoint} ${review.idealPoint}`
            : `✗ ${t.outOfRange} · ${t.idealRange} [${review.idealRange[0]}, ${review.idealRange[1]}] · ${t.idealPoint} ${review.idealPoint}`
        }
        locale={locale}
      />
      {review.tries.length === 0 ? (
        <p className="text-xs text-slate-400">{t.emptyTries}</p>
      ) : (
        <ol className="space-y-1">
          {review.tries.map((tr, i) => (
            <li key={i} className="flex items-center gap-3 rounded border border-line bg-white/60 px-3 py-1.5 text-xs">
              <span className="font-mono text-slate-500">#{i + 1}</span>
              <span className="text-slate-600">{t.position} <span className="font-mono">{tr.position}</span></span>
              <span className="text-slate-400">·</span>
              <span className={tr.inRange ? 'text-emerald-700' : 'text-red-600'}>
                {tr.inRange ? t.inRange : `${t.outOfRange} (${tr.dir === 'left' ? t.left : t.right})`}
              </span>
              <span className="ml-auto font-mono text-slate-500">{tr.precision}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/* ---------------- Defusal ---------------- */
function DefusalSection({
  review,
  locale,
  t,
}: {
  review: Extract<StepReviewItem, { kind: 'defusal' }>
  locale: Locale
  t: (typeof T)[Locale]
}) {
  return (
    <div className="space-y-3">
      <SummaryLine
        primary={`${badge('拆除', 'Defused', locale)} ${review.summary.defusedCount}/${review.summary.total}`}
        secondary={`${review.wrongDecoys} ${t.decoys}`}
        locale={locale}
      />
      <ol className="space-y-2">
        {review.traps.map((it) => (
          <li key={it.spotId} className="rounded-lg border border-line bg-white/60 p-3">
            <div className="flex items-start gap-2">
              <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[it.status]}`} />
              <div className="flex-1">
                <p className="text-sm text-slate-800">{it.label}</p>
                {it.debunkText && (
                  <p className="mt-1 rounded border border-amber-300/50 bg-amber-50/60 px-2 py-1 text-xs text-amber-900">
                    💡 {it.debunkText}
                  </p>
                )}
                {it.status === 'miss' && (
                  <p className="mt-1 text-[11px] text-slate-500">{badge('未拆除', 'not defused', locale)}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---------------- Tamer ---------------- */
function TamerSection({
  review,
  locale,
  t,
}: {
  review: Extract<StepReviewItem, { kind: 'tamer' }>
  locale: Locale
  t: (typeof T)[Locale]
}) {
  return (
    <div className="space-y-3">
      <SummaryLine
        primary={`${badge('安抚', 'Calmed', locale)} ${review.summary.calmedCount}/${review.summary.total}`}
        secondary={`${review.summary.wrongTries} ${t.wrongs} · ${review.summary.nearMissTries} ${t.nearMiss}`}
        locale={locale}
      />
      <ol className="space-y-2">
        {review.items.map((it) => (
          <li key={it.eventId} className="rounded-lg border border-line bg-white/60 p-3">
            <div className="flex items-start gap-2">
              <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[it.status]}`} />
              <div className="flex-1">
                <p className="text-sm text-slate-800">{it.impulsePrompt}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {badge('偏见', 'bias', locale)}: {it.biasLabel}
                  {it.wrongTries + it.nearMissTries > 0 && (
                    <> · {it.wrongTries} {t.wrongs} / {it.nearMissTries} {t.nearMiss}</>
                  )}
                </p>
                <p className="mt-1 rounded border border-emerald-300/50 bg-emerald-50/60 px-2 py-1 text-xs text-emerald-900">
                  ✓ <span className="font-semibold">{badge('正确回应', 'correct response', locale)}: </span>
                  {it.correctText}
                </p>
                <p className="mt-1 text-xs text-slate-600">{it.calmExplanation}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---------------- shared ---------------- */
function SummaryLine({ primary, secondary, locale: _ }: { primary: string; secondary: string; locale: Locale }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
      <span className="font-semibold text-slate-800">{primary}</span>
      <span className="text-slate-500">{secondary}</span>
    </div>
  )
}