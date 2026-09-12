import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ENGINE_BADGES } from '../content/chapters'
import type { EngineType, Locale } from '../schema/levelTypes'

interface MoveLesson {
  summary: string
  useWhen: string
  questions: string[]
  example: string
  takeaway: string
}

interface MoveContent {
  icon: string
  chapters: number[]
  practiceChapter: number
  accent: string
  iconStyle: string
  zh: MoveLesson
  en: MoveLesson
}

const MOVE_CONTENT: Record<EngineType, MoveContent> = {
  xray: {
    icon: '🔍',
    chapters: [2, 3, 5, 11],
    practiceChapter: 2,
    accent: 'border-cyan-600/30 bg-cyan-50/70',
    iconStyle: 'border-cyan-600/30 bg-cyan-50 text-cyan-700',
    zh: {
      summary: '把一段话拆成论题、结论、理由、隐藏假设与遗漏信息。先看清论证骨架，再决定是否接受它。',
      useWhen: '读方案、听汇报、刷到观点视频，或双方一直争论却说不清争点时。',
      questions: ['对方真正想让我接受什么？', '哪些理由在支撑它，而不是只重复结论？', '论证成立还依赖哪些没说出口的前提？'],
      example: '“同行都在用 AI，所以我们也必须立刻采购。”透视后会发现：结论是“立刻采购”，理由是“同行在用”，隐藏假设是“同行适用的方案也适合我们”。',
      takeaway: '结构清楚，不代表结论正确；但结构不清，你甚至不知道该检查哪里。',
    },
    en: {
      summary: 'Separate an argument into its issue, conclusion, reasons, hidden assumptions, and missing information before deciding whether to accept it.',
      useWhen: 'Reading proposals, hearing a pitch, watching opinion content, or entering a debate where nobody can name the real issue.',
      questions: ['What exactly am I being asked to accept?', 'Which reasons support it instead of merely repeating it?', 'What unstated assumptions must be true?'],
      example: '“Our competitors use AI, so we must buy it now.” The conclusion is “buy now,” the reason is “competitors use it,” and the hidden assumption is that their solution fits us too.',
      takeaway: 'A visible structure does not make a claim true—but without it, you do not know what to test.',
    },
  },
  courtroom: {
    icon: '⚖️',
    chapters: [6, 7, 8, 9],
    practiceChapter: 6,
    accent: 'border-rose-600/25 bg-rose-50/60',
    iconStyle: 'border-rose-600/25 bg-rose-50 text-rose-700',
    zh: {
      summary: '像交叉询问一样检验证据：信源可靠吗、推理有没有谬误、因果关系是否存在其他解释。',
      useWhen: '面对专家意见、个人证言、“研究表明”以及把相关性说成因果的结论时。',
      questions: ['证据来自谁，他有专业边界或利益冲突吗？', '一个个案能代表总体吗？', '除了作者给出的原因，还有哪些合理解释？'],
      example: '“我朋友吃了这种补剂后精神变好，所以它有效。”经历可能真实，但睡眠、安慰剂效应和同期生活变化都是替代原因。',
      takeaway: '质询不是为了否定一切，而是让结论的力度配得上证据。',
    },
    en: {
      summary: 'Cross-examine evidence: test source credibility, reasoning fallacies, and rival explanations for causal claims.',
      useWhen: 'Facing expert opinion, testimonials, “research shows,” or a conclusion that turns correlation into causation.',
      questions: ['Who produced the evidence, and do they have limits or conflicts?', 'Can one case represent the wider population?', 'What rival causes could also explain the result?'],
      example: '“My friend felt better after taking this supplement, so it works.” The experience may be real, while sleep, placebo effects, and lifestyle changes remain rival causes.',
      takeaway: 'Cross-examination is not automatic rejection; it makes the strength of a conclusion match its evidence.',
    },
  },
  scale: {
    icon: '⚗️',
    chapters: [4, 12],
    practiceChapter: 4,
    accent: 'border-violet-600/25 bg-violet-50/60',
    iconStyle: 'border-violet-600/25 bg-violet-50 text-violet-700',
    zh: {
      summary: '校准模糊词语和结论强度。很多问题不是简单的对或错，而是“在什么定义与条件下，能说到什么程度”。',
      useWhen: '讨论“优秀、公平、安全、有效”等模糊词，或证据只能支持有限结论时。',
      questions: ['关键词在这里具体是什么意思？', '换一种合理定义，结论还成立吗？', '证据支持的是“可能”“多数”还是“必然”？'],
      example: '“这个项目表现很好。”先追问“好”指营收、留存还是满意度，再确认比较周期和基准，结论才有可检验的刻度。',
      takeaway: '成熟判断往往不是选边站，而是标出合理区间和成立条件。',
    },
    en: {
      summary: 'Calibrate ambiguous language and conclusion strength. Many judgments depend on definitions, conditions, and degree—not a simple true or false.',
      useWhen: 'Discussing vague words such as “excellent,” “fair,” “safe,” or “effective,” or when evidence supports only a limited claim.',
      questions: ['What does the key term mean here, precisely?', 'Would the claim survive another reasonable definition?', 'Does the evidence support “possible,” “typical,” or “certain”?'],
      example: '“The project performed well.” Ask whether “well” means revenue, retention, or satisfaction, then identify the period and baseline before judging.',
      takeaway: 'Mature judgment often means marking a reasonable range and its conditions, not picking a side.',
    },
  },
  defusal: {
    icon: '🧨',
    chapters: [10],
    practiceChapter: 10,
    accent: 'border-orange-600/25 bg-orange-50/60',
    iconStyle: 'border-orange-600/25 bg-orange-50 text-orange-700',
    zh: {
      summary: '拆解数字制造的错觉：追查分母、基数、样本、平均数和图表尺度，恢复数字原本能支持的结论。',
      useWhen: '看到百分比增长、风险下降、平均薪资、调查结果或视觉冲击很强的图表时。',
      questions: ['百分比的分母和原始数量是什么？', '样本如何选择，遗漏了谁？', '图表起点、平均数或统计口径是否改变了观感？'],
      example: '“风险降低 50%”可能只是从一万人中 2 例降到 1 例。相对降幅没错，但绝对变化决定它对你有多重要。',
      takeaway: '数字可以完全真实，却仍然诱导错误判断；关键是补回被省略的参照系。',
    },
    en: {
      summary: 'Defuse numerical illusions by recovering denominators, base rates, samples, averages, and chart scales.',
      useWhen: 'Seeing percentage growth, risk reduction, average salaries, survey findings, or visually dramatic charts.',
      questions: ['What are the denominator and raw counts?', 'How was the sample selected, and who is missing?', 'Did the axis, average, or measurement rule change the impression?'],
      example: '“Risk fell by 50%” may mean a drop from 2 cases in 10,000 to 1. The relative change is true, while the absolute change tells you its practical importance.',
      takeaway: 'Numbers can be accurate and still mislead; restore the missing frame of reference.',
    },
  },
  tamer: {
    icon: '🐘',
    chapters: [1, 13],
    practiceChapter: 1,
    accent: 'border-amber-600/30 bg-amber-50/70',
    iconStyle: 'border-amber-600/30 bg-amber-50 text-amber-700',
    zh: {
      summary: '在情绪、身份和确认偏误替你作答之前暂停一下，从“吸收观点”切换到“主动检验观点”。',
      useWhen: '某个观点让你立刻愤怒、认同、想转发，或它恰好证明了你一直相信的事情时。',
      questions: ['我现在是在评估证据，还是在保护立场？', '什么证据会让我改变看法？', '如果同一句话来自我不喜欢的人，我会怎样判断？'],
      example: '看到支持自己立场的标题时，先不转发，尝试写出一个可能推翻它的事实，再打开正文检查证据。',
      takeaway: '批判性思维不只审问别人，也要能在自己的直觉冲到终点前叫停它。',
    },
    en: {
      summary: 'Pause before emotion, identity, or confirmation bias answers for you; shift from absorbing a claim to actively testing it.',
      useWhen: 'A claim makes you instantly angry, pleased, eager to share, or conveniently confirms what you already believe.',
      questions: ['Am I evaluating evidence or defending an identity?', 'What evidence would change my mind?', 'Would I judge the same words differently from someone I dislike?'],
      example: 'When a headline supports your view, delay sharing it, name one fact that could disprove it, then open the article and inspect the evidence.',
      takeaway: 'Critical thinking questions other people—and catches your own intuition before it reaches the verdict.',
    },
  },
}

const UI = {
  zh: {
    eyebrow: '思考动作说明书',
    useWhen: '什么时候调用',
    questions: '三个核心追问',
    example: '微型示例',
    takeaway: '带走一句话',
    chapters: '对应章节',
    practice: '去练习这个动作 →',
    close: '关闭知识讲解',
  },
  en: {
    eyebrow: 'Thinking move field guide',
    useWhen: 'When to use it',
    questions: 'Three questions to ask',
    example: 'Mini example',
    takeaway: 'One-line takeaway',
    chapters: 'Related chapters',
    practice: 'Practice this move →',
    close: 'Close lesson',
  },
} as const

interface Props {
  engine: EngineType | null
  locale: Locale
  onClose: () => void
  onPractice: (chapterId: number) => void
}

export default function ThinkingMoveModal({ engine, locale, onClose, onPractice }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!engine) return undefined
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousRootOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.documentElement.style.overflow = previousRootOverflow
      document.body.style.overflow = previousBodyOverflow
      window.removeEventListener('keydown', handleKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [engine, onClose])

  if (!engine) return null

  const content = MOVE_CONTENT[engine]
  const lesson = content[locale]
  const t = UI[locale]
  const badge = ENGINE_BADGES[engine]

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-slate-900/35 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        id="thinking-move-dialog"
        data-testid="thinking-move-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thinking-move-title"
        aria-describedby="thinking-move-summary"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gold/40 bg-white shadow-[0_20px_60px_rgba(61,56,49,0.22)] sm:max-h-[calc(100dvh-2rem)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t.close}
          title={t.close}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/95 text-lg font-semibold text-slate-500 shadow-sm transition hover:border-amber-500 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          ×
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
          <div className="flex items-start gap-3 pr-10">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl ${content.iconStyle}`}>
              {content.icon}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{t.eyebrow}</p>
              <h2 id="thinking-move-title" className="mt-1 text-xl font-black text-slate-800">
                {badge[locale]}
              </h2>
            </div>
          </div>

          <p id="thinking-move-summary" className="mt-4 text-sm leading-7 text-slate-700">
            {lesson.summary}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <section className={`rounded-xl border p-4 ${content.accent}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.useWhen}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{lesson.useWhen}</p>
            </section>
            <section className="rounded-xl border border-line bg-panel-2 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.chapters}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.chapters.map((chapter) => (
                  <span key={chapter} className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {locale === 'zh' ? `第 ${chapter} 章` : `Ch. ${chapter}`}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-3 rounded-xl border border-line bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.questions}</h3>
            <ol className="mt-3 space-y-2">
              {lesson.questions.map((question, index) => (
                <li key={question} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-3 rounded-xl border border-line bg-panel-2 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.example}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{lesson.example}</p>
          </section>

          <section className="mt-3 rounded-xl border-l-4 border-gold bg-amber-50 px-4 py-3">
            <h3 className="text-xs font-bold text-amber-800">{t.takeaway}</h3>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">{lesson.takeaway}</p>
          </section>
        </div>

        <div className="shrink-0 border-t border-line bg-white/95 p-3.5 sm:p-4">
          <button
            type="button"
            onClick={() => onPractice(content.practiceChapter)}
            className="w-full rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(217,154,30,0.24)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            {t.practice}
          </button>
        </div>
      </motion.section>
    </div>
  )
}
