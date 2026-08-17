// 关卡页：加载关卡 JSON + 当前语言文本，组装运行时数据，按 engine 分发到对应引擎。
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLevelById, getLevelsByChapter } from '../content/levelIndex'
import { CHAPTERS } from '../content/chapters'
import { useSettingsStore } from '../store/settingsStore'
import XrayEngine from '../engines/xray/XrayEngine'
import type { XrayAnchor, XrayRuntimeLevel } from '../schema/levelTypes'

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const locale = useSettingsStore((s) => s.locale)

  const def = levelId ? getLevelById(levelId) : undefined

  const runtime: XrayRuntimeLevel | null = useMemo(() => {
    if (!def) return null
    const texts = def.texts[locale]
    const visible = [...def.data.nodes, ...def.data.distractors].filter((n) => !n.hidden)
    const hidden = [...def.data.nodes].filter((n) => n.hidden)
    const anchors: XrayAnchor[] = [
      ...visible.map((n) => ({
        nodeId: n.nodeId,
        type: n.type,
        anchorText: texts.textRefs[n.textRef],
        isCorrect: def.data.nodes.some((c) => c.nodeId === n.nodeId),
      })),
    ]
    const hiddenNodes: XrayAnchor[] = hidden.map((n) => ({
      nodeId: n.nodeId,
      type: n.type,
      anchorText: texts.textRefs[n.textRef],
      isCorrect: true,
    }))
    const gaps = (def.data.gaps ?? []).map((g) => ({
      gapId: g.gapId,
      correctText: texts.textRefs[g.correctTextRef],
      candidates: texts.gapRefs?.[g.gapId] ?? [],
    }))
    return {
      meta: def.meta,
      mode: def.data.mode ?? 'scan',
      sourceText: texts.sourceText,
      anchors,
      hiddenNodes,
      gaps,
      hints: texts.hints,
      explanation: texts.explanation,
      correctChain: def.data.correctChain,
    }
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

      <XrayEngine
        key={`${def.meta.levelId}-${locale}`}
        level={runtime}
        chapterTitle={chapterTitle}
        onExit={() => navigate(`/chapter/${def.meta.chapter}`)}
        onHome={() => navigate('/')}
        nextLevelId={next?.meta.levelId}
        onNext={() => next && navigate(`/level/${next.meta.levelId}`)}
        onReplay={() => {
          /* 引擎内部已重置状态，无需额外操作 */
        }}
      />
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
