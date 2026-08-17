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
  XrayAnchor,
  XrayLevelData,
  XrayRuntimeLevel,
  XrayTexts,
} from '../schema/levelTypes'

// 引擎B 懒加载：避免首屏引入法庭引擎代码
const CourtroomEngine = lazy(() => import('../engines/courtroom/CourtroomEngine'))

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const locale = useSettingsStore((s) => s.locale)

  const def = levelId ? getLevelById(levelId) : undefined

  const runtime = useMemo<XrayRuntimeLevel | CourtroomRuntimeLevel | null>(() => {
    if (!def) return null

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
    key: `${def.meta.levelId}-${locale}`,
    chapterTitle,
    onExit: () => navigate(`/chapter/${def.meta.chapter}`),
    onHome: () => navigate('/'),
    nextLevelId: next?.meta.levelId,
    onNext: () => next && navigate(`/level/${next.meta.levelId}`),
    onReplay: () => {
      /* 引擎内部已重置状态，无需额外操作 */
    },
  }

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
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
              {locale === 'zh' ? '法庭准备中…' : 'Preparing the courtroom…'}
            </div>
          }
        >
          <CourtroomEngine level={runtime as CourtroomRuntimeLevel} {...sharedProps} />
        </Suspense>
      ) : (
        <XrayEngine level={runtime as XrayRuntimeLevel} {...sharedProps} />
      )}
    </div>
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
