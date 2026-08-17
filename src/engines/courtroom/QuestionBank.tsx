// 问题弹药库（lineup 模式显示为"证据卡堆"）：可拖拽 + 可点选。
// 注意：不用 framer-motion 的 motion.button——它会拦截 onDragStart 手势，吞掉 HTML5 拖拽事件。
import type { CourtroomMode, Locale } from '../../schema/levelTypes'
import { COURT_UI } from './courtI18n'
import type { CourtroomQuestion } from './useCourtroomLogic'

interface Props {
  mode: CourtroomMode
  questions: CourtroomQuestion[]
  usedIds: Set<string>
  flashQuestionId: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onDragStart: (q: CourtroomQuestion) => void
  locale: Locale
}

export default function QuestionBank({
  mode,
  questions,
  usedIds,
  flashQuestionId,
  selectedId,
  onSelect,
  onDragStart,
  locale,
}: Props) {
  const t = COURT_UI[locale]
  const isLineup = mode === 'lineup'

  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          {isLineup ? '🃏 ' + t.evidenceBank : '❓ ' + t.questionBank}
          <span className="ml-2 font-mono text-xs text-slate-400">({questions.length})</span>
        </h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">{isLineup ? t.evidenceBankTip : t.questionBankTip}</p>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scroll-thin">
        {questions.map((q) => {
          const used = usedIds.has(q.questionId)
          const flash = flashQuestionId === q.questionId
          const selected = selectedId === q.questionId
          return (
            <button
              key={q.questionId}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', q.questionId)
                e.dataTransfer.effectAllowed = 'move'
                onDragStart(q)
              }}
              onClick={() => onSelect(selected ? null : q.questionId)}
              className={`relative w-44 shrink-0 cursor-grab rounded-xl border-2 bg-panel-2 px-3 py-3 text-left transition active:cursor-grabbing ${
                flash ? 'court-shake border-court' : selected ? 'border-court bg-court/5' : 'border-line hover:border-court/50'
              } ${used && !selected ? 'opacity-50' : ''}`}
            >
              {used ? (
                <span className="absolute -top-2 right-2 rounded-full bg-court/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  ✗ {locale === 'zh' ? '试错' : 'Miss'}
                </span>
              ) : selected ? (
                <span className="absolute -top-2 right-2 rounded-full bg-court px-1.5 py-0.5 text-[10px] font-bold text-white">
                  ✓ {locale === 'zh' ? '已选' : 'Picked'}
                </span>
              ) : null}
              <span className={`block text-sm font-medium leading-snug ${used && !selected ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {q.text}
              </span>
              <span className="mt-2 block font-mono text-[11px] text-court/80">
                ⚡ {q.sharpness} {t.sharpness}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
