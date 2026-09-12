import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Locale } from '../schema/levelTypes'

export const ONBOARDING_STORAGE_KEY = 'atrq-onboarding-v1'

type Answer = 'control' | 'satisfaction' | 'popularity'

interface Props {
  locale: Locale
  onToggleLocale: () => void
  onFinish: (destination: 'level' | 'roadmap') => void
  onSkip: () => void
}

const COPY = {
  zh: {
    eyebrow: '60 秒思维体检',
    title: '一个真实数据，也可能推出一个过头的结论',
    intro:
      '先做一道没有“愚蠢选项”的小练习。你不需要懂术语，只要判断：哪条信息最值得先追问？',
    start: '开始挑战',
    skip: '暂时跳过',
    progress: '第 1 题 · 约 40 秒',
    caseLabel: '公司内部试验',
    caseText:
      '某公司让自愿报名的两个团队试行四天工作制。三个月后，这两个团队的产出比上季度提高 18%，满意度也上升。负责人因此认为：四天工作制能提高所有团队的效率，应该立即在全公司推行。',
    question: '如果只能先补一条信息，哪一条最可能改变你对这个结论的判断？',
    answers: {
      control: '这些团队试行前是否本来就表现更好？同期未试行的相似团队发生了什么？',
      satisfaction: '参与员工是否普遍喜欢每周多休息一天？',
      popularity: '还有哪些知名公司已经采用四天工作制？',
    },
    revealLabel: '判断复盘',
    reveal: {
      control: {
        badge: '击中核心',
        text: '你抓住了自愿报名和缺少对照的问题。只有比较起点相近的团队，才更有机会把变化归因于工作制度。',
      },
      satisfaction: {
        badge: '相关，但还不够',
        text: '满意度是真实而重要的信息，所以这个选项很诱人；但它支持的是“员工喜欢”，不是“效率提高”，也排除不了季度波动。',
      },
      popularity: {
        badge: '看似有背书',
        text: '更多公司采用会增强信心，却不能修复这次试验的自选偏差。别人做过，不等于这组数据已经证明了因果。',
      },
    },
    insight: '真正危险的往往不是假数据，而是真数据支撑了一个过强的结论。',
    bridge: '接下来的 35 关，会反复训练这种“先找到缺口，再决定相信多少”的动作。',
    enter: '进入第一章',
    roadmap: '先看看 13 章路线',
  },
  en: {
    eyebrow: '60-second thinking check',
    title: 'Real data can still support an overreaching conclusion',
    intro:
      'Start with one exercise where none of the options is silly. No jargon needed: decide which missing fact deserves your first question.',
    start: 'Take the challenge',
    skip: 'Maybe later',
    progress: 'Question 1 · about 40 sec',
    caseLabel: 'Internal company trial',
    caseText:
      'A company let two volunteer teams try a four-day workweek. Three months later, their output was 18% higher than the previous quarter and satisfaction rose. A leader concluded that four-day weeks improve every team’s productivity and should roll out company-wide immediately.',
    question: 'If you could add only one fact first, which would most change how you judge that conclusion?',
    answers: {
      control: 'Were these teams already stronger before the trial, and what happened to similar teams that kept the old schedule?',
      satisfaction: 'Did participating employees generally enjoy having an extra day off?',
      popularity: 'Which other well-known companies already use a four-day workweek?',
    },
    revealLabel: 'Judgment review',
    reveal: {
      control: {
        badge: 'Core issue found',
        text: 'You caught self-selection and the missing comparison. Similar starting points and a control group make a causal explanation much more credible.',
      },
      satisfaction: {
        badge: 'Relevant, not sufficient',
        text: 'Satisfaction is real and important, which makes this tempting. But it supports “employees like it,” not “productivity rose,” and it cannot rule out a seasonal change.',
      },
      popularity: {
        badge: 'Persuasive-looking support',
        text: 'More adopters may increase confidence, but they do not repair self-selection in this trial. Others doing it does not make this evidence causal.',
      },
    },
    insight: 'The most dangerous evidence is often not fake data, but real data carrying a conclusion that is too strong.',
    bridge: 'The next 35 levels repeatedly train the same move: find the gap first, then decide how much to believe.',
    enter: 'Enter Chapter One',
    roadmap: 'See the 13-chapter path',
  },
} as const

export default function FirstRunOnboarding({ locale, onToggleLocale, onFinish, onSkip }: Props) {
  const [stage, setStage] = useState<'intro' | 'question' | 'reveal'>('intro')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const t = COPY[locale]

  const choose = (value: Answer) => {
    setAnswer(value)
    setStage('reveal')
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 px-4 py-5 backdrop-blur-sm sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      data-testid="first-run-onboarding"
    >
      <div className="mx-auto flex min-h-full max-w-2xl items-center justify-center">
        <motion.section
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full overflow-hidden rounded-3xl border border-amber-300/70 bg-[#fffdf8] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-line bg-amber-50/70 px-5 py-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
              {t.eyebrow}
            </span>
            <button
              type="button"
              onClick={onToggleLocale}
              className="rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-white"
            >
              {locale === 'zh' ? 'EN' : '中文'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {stage === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="px-6 py-8 text-center sm:px-10 sm:py-10"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100 text-3xl">
                  ⛏️
                </div>
                <h2 id="onboarding-title" className="mx-auto mt-5 max-w-lg text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                  {t.title}
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600">{t.intro}</p>
                <button
                  type="button"
                  onClick={() => setStage('question')}
                  className="mt-7 w-full rounded-xl bg-gold px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(217,154,30,0.28)] hover:brightness-105 sm:w-auto"
                >
                  {t.start} →
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="mt-4 block w-full text-xs text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline"
                >
                  {t.skip}
                </button>
              </motion.div>
            )}

            {stage === 'question' && (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="px-5 py-6 sm:px-8 sm:py-8"
              >
                <p className="text-xs font-semibold text-slate-400">{t.progress}</p>
                <div className="mt-3 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-700">{t.caseLabel}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{t.caseText}</p>
                </div>
                <h2 id="onboarding-title" className="mt-5 text-base font-bold leading-7 text-slate-900">
                  {t.question}
                </h2>
                <div className="mt-4 grid gap-2.5">
                  {(Object.keys(t.answers) as Answer[]).map((key, index) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => choose(key)}
                      className="group flex min-h-14 items-start gap-3 rounded-xl border-2 border-line bg-white px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:border-amber-400 hover:bg-amber-50/50"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 font-mono text-xs font-bold text-slate-500 group-hover:border-amber-500 group-hover:text-amber-700">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{t.answers[key]}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {stage === 'reveal' && answer && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-6 py-7 sm:px-9 sm:py-9"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">{t.revealLabel}</p>
                <div className={`mt-3 rounded-2xl border p-5 ${answer === 'control' ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
                  <p className={`text-sm font-black ${answer === 'control' ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {answer === 'control' ? '✓' : '△'} {t.reveal[answer].badge}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{t.reveal[answer].text}</p>
                </div>
                <blockquote className="mt-5 border-l-4 border-gold pl-4 text-lg font-black leading-8 text-slate-900">
                  {t.insight}
                </blockquote>
                <p className="mt-3 text-sm leading-6 text-slate-500">{t.bridge}</p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_auto]">
                  <button
                    type="button"
                    onClick={() => onFinish('level')}
                    className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(217,154,30,0.25)] hover:brightness-105"
                  >
                    {t.enter} →
                  </button>
                  <button
                    type="button"
                    onClick={() => onFinish('roadmap')}
                    className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:border-amber-400 hover:text-amber-800"
                  >
                    {t.roadmap}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  )
}
