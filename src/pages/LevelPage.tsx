// 关卡页：加载关卡 JSON + 当前语言文本，组装运行时数据，按 engine 分发到对应引擎。
import { lazy, Suspense, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLevelById, getLevelsByChapter } from '../content/levelIndex'
import { CHAPTERS } from '../content/chapters'
import { useSettingsStore } from '../store/settingsStore'
import XrayEngine from '../engines/xray/XrayEngine'
import type {
  CourtroomLevelData,
  CourtroomRuntimeLevel,
  CourtroomTexts,
  DefusalLevelData,
  DefusalRuntimeLevel,
  DefusalTexts,
  ScaleLevelData,
  ScaleRuntimeLevel,
  ScaleTexts,
  TamerLevelData,
  TamerRuntimeLevel,
  TamerTexts,
  XrayAnchor,
  XrayLevelData,
  XrayRuntimeLevel,
  XrayTexts,
} from '../schema/levelTypes'

// 引擎B/C/D/E 懒加载：避免首屏引入全部引擎代码
const CourtroomEngine = lazy(() => import('../engines/courtroom/CourtroomEngine'))
const ScaleEngine = lazy(() => import('../engines/scale/ScaleEngine'))
const DefusalEngine = lazy(() => import('../engines/defusal/DefusalEngine'))
const TamerEngine = lazy(() => import('../engines/tamer/TamerEngine'))

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const locale = useSettingsStore((s) => s.locale)

  const def = levelId ? getLevelById(levelId) : undefined

  const runtime = useMemo<
    XrayRuntimeLevel | CourtroomRuntimeLevel | ScaleRuntimeLevel | DefusalRuntimeLevel | TamerRuntimeLevel | null
  >(() => {
    if (!def) return null

    // —— 引擎E 心智驯兽场 ——
    if (def.meta.engine === 'tamer') {
      const data = def.data as TamerLevelData
      const texts = (def.texts as { zh: TamerTexts; en: TamerTexts })[locale]
      const events = data.impulseEvents.map((ev) => ({
        eventId: ev.eventId,
        biasType: ev.biasType,
        biasLabel: texts.eventMeta[ev.eventId]?.biasLabel ?? ev.biasType,
        impulsePrompt: texts.impulsePrompts[ev.eventId] ?? '',
        options: ev.optionRefs.map((ref) => ({ key: ref, text: texts.options[ref] ?? ref })),
        correctKey: ev.correctOptionRef,
        calm: texts.eventMeta[ev.eventId]?.calm ?? '',
      }))
      const result: TamerRuntimeLevel = {
        meta: def.meta,
        mode: data.mode ?? 'tutorial',
        scenario: texts.scenario,
        events,
        initialRage: data.initialRage ?? 20,
        ragePerMiss: data.ragePerMiss ?? 20,
        hints: texts.hints,
        explanation: texts.explanation,
      }
      return result
    }
    // —— 引擎B 逻辑法庭 ——
    if (def.meta.engine === 'courtroom') {
      const data = def.data as CourtroomLevelData
      const texts = (def.texts as { zh: CourtroomTexts; en: CourtroomTexts })[locale]
      const weakSpots = data.weakSpots.map((s) => ({
        spotId: s.spotId,
        anchorText: texts.textRefs[s.anchorTextRef],
        issueType: s.issueType,
        debunkText: texts.textRefs[s.debunkRef],
        sharpness: s.sharpness,
      }))
      const questions = data.questionBank.map((q) => ({
        questionId: q.questionId,
        text: texts.textRefs[q.textRef],
        sharpness: q.sharpness,
        targetIssue: q.targetIssue,
        isRelevant: q.isRelevant,
      }))
      const result: CourtroomRuntimeLevel = {
        meta: def.meta,
        mode: data.mode ?? 'trial',
        caseTitle: texts.caseTitle,
        witnessName: texts.witnessName,
        testimony: texts.testimony,
        credibility: data.credibility,
        weakSpots,
        questions,
        hints: texts.hints,
        explanation: texts.explanation,
      }
      return result
    }

    // —— 引擎C 天平校准站 ——
    if (def.meta.engine === 'scale') {
      const data = def.data as ScaleLevelData
      const texts = (def.texts as { zh: ScaleTexts; en: ScaleTexts })[locale]
      const result: ScaleRuntimeLevel = {
        meta: def.meta,
        mode: data.mode ?? 'spectrum',
        prompt: texts.prompt,
        spectrumLabels: texts.spectrumLabels,
        idealRange: data.idealRange,
        idealPoint: data.idealPoint,
        hints: texts.hints,
        explanation: texts.explanation,
      }
      return result
    }

    // —— 引擎D 数据拆弹 ——
    if (def.meta.engine === 'defusal') {
      const data = def.data as DefusalLevelData
      const texts = (def.texts as { zh: DefusalTexts; en: DefusalTexts })[locale]
      const chartData = data.chartData.map((d, i) => ({
        label: texts.labels[i] ?? d.labelRef,
        value: d.value,
      }))
      const spots = data.suspectSpots.map((s) => ({
        spotId: s.spotId,
        barIndex: s.barIndex,
        isTrap: s.isTrap,
        debunkText: s.debunkRef ? texts.textRefs[s.debunkRef] : undefined,
      }))
      const result: DefusalRuntimeLevel = {
        meta: def.meta,
        chartTitle: texts.chartTitle,
        chartData,
        yAxis: data.yAxis,
        spots,
        manual: texts.manual,
        hints: texts.hints,
        explanation: texts.explanation,
      }
      return result
    }

    // —— 引擎A 论证透视镜 ——
    const data = def.data as XrayLevelData
    const texts = (def.texts as { zh: XrayTexts; en: XrayTexts })[locale]
    const visible = [...data.nodes, ...data.distractors].filter((n) => !n.hidden)
    const hidden = [...data.nodes].filter((n) => n.hidden)
    const anchors: XrayAnchor[] = [
      ...visible.map((n) => ({
        nodeId: n.nodeId,
        type: n.type,
        anchorText: texts.textRefs[n.textRef],
        isCorrect: data.nodes.some((c) => c.nodeId === n.nodeId),
      })),
    ]
    const hiddenNodes: XrayAnchor[] = hidden.map((n) => ({
      nodeId: n.nodeId,
      type: n.type,
      anchorText: texts.textRefs[n.textRef],
      isCorrect: true,
    }))
    const gaps = (data.gaps ?? []).map((g) => ({
      gapId: g.gapId,
      correctText: texts.textRefs[g.correctTextRef],
      candidates: texts.gapRefs?.[g.gapId] ?? [],
    }))
    // 步骤序列：缺省时所有正确目标合并为单步
    const allCorrectIds = [
      ...data.nodes.map((n) => n.nodeId),
      ...(data.gaps ?? []).map((g) => `gap:${g.gapId}`),
    ]
    const steps =
      data.steps && data.steps.length > 0
        ? data.steps
        : [{ stepId: 's1', targets: allCorrectIds }]
    const result: XrayRuntimeLevel = {
      meta: def.meta,
      mode: data.mode ?? 'scan',
      sourceText: texts.sourceText,
      anchors,
      hiddenNodes,
      gaps,
      steps,
      hints: texts.hints,
      explanation: texts.explanation,
      correctChain: data.correctChain,
    }
    return result
  }, [def, locale])

  if (!def || !runtime) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        {locale === 'zh' ? '关卡不存在' : 'Level not found'}
      </div>
    )
  }

  const chapter = CHAPTERS.find((c) => c.id === def.meta.chapter)
  const chapterTitle = chapter ? chapter.title[locale] : def.meta.levelId
  const chapterLevels = getLevelsByChapter(def.meta.chapter)
  const currentIdx = chapterLevels.findIndex((l) => l.meta.levelId === def.meta.levelId)
  const next = chapterLevels[currentIdx + 1]

  const sharedProps = {
    chapterTitle,
    onExit: () => navigate(`/chapter/${def.meta.chapter}`),
    onHome: () => navigate('/'),
    nextLevelId: next?.meta.levelId,
    onNext: () => next && navigate(`/level/${next.meta.levelId}`),
    onReplay: () => {
      /* 引擎内部已重置状态，无需额外操作 */
    },
  }

  const engineKey = `${def.meta.levelId}-${locale}`

  const fallbackText: Record<string, string> = {
    courtroom: locale === 'zh' ? '法庭准备中…' : 'Preparing the courtroom…',
    scale: locale === 'zh' ? '校准台就绪…' : 'Calibrating…',
    defusal: locale === 'zh' ? '拆弹装备检查中…' : 'Checking the wire kit…',
    tamer: locale === 'zh' ? '大象在等你…' : 'The elephant awaits…',
  }
  const fallback = fallbackText[def.meta.engine] ?? 'Loading…'

  return (
    <div className="min-h-screen bg-abyss pt-8">
      {/* 顶栏：语言切换 */}
      <header className="mx-auto mb-6 flex max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2 text-amber-700">
          <span className="text-xl">⛏</span>
          <span className="text-sm font-bold tracking-wide">
            {locale === 'zh' ? '学会提问' : 'Asking the Right Questions'}
          </span>
        </div>
        <LangSwitch />
      </header>

      {def.meta.engine === 'courtroom' ? (
        <Suspense fallback={<LoadingFallback text={fallback} />}>
          <CourtroomEngine key={engineKey} level={runtime as CourtroomRuntimeLevel} {...sharedProps} />
        </Suspense>
      ) : def.meta.engine === 'scale' ? (
        <Suspense fallback={<LoadingFallback text={fallback} />}>
          <ScaleEngine key={engineKey} level={runtime as ScaleRuntimeLevel} {...sharedProps} />
        </Suspense>
      ) : def.meta.engine === 'defusal' ? (
        <Suspense fallback={<LoadingFallback text={fallback} />}>
          <DefusalEngine key={engineKey} level={runtime as DefusalRuntimeLevel} {...sharedProps} />
        </Suspense>
      ) : def.meta.engine === 'tamer' ? (
        <Suspense fallback={<LoadingFallback text={fallback} />}>
          <TamerEngine key={engineKey} level={runtime as TamerRuntimeLevel} {...sharedProps} />
        </Suspense>
      ) : (
        <XrayEngine key={engineKey} level={runtime as XrayRuntimeLevel} {...sharedProps} />
      )}
    </div>
  )
}

function LoadingFallback({ text }: { text: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">{text}</div>
  )
}

function LangSwitch() {
  const locale = useSettingsStore((s) => s.locale)
  const setLocale = useSettingsStore((s) => s.setLocale)
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-amber-600/50 hover:text-amber-700"
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </button>
  )
}
