import type { NodeType } from '../../schema/levelTypes'

export const NODE_VISUALS: Record<
  NodeType,
  { emoji: string; found: string; label: string }
> = {
  conclusion: {
    emoji: '🚩',
    found: 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-[0_0_0_1px_rgba(14,116,144,0.18)]',
    label: 'conclusion',
  },
  reason: {
    emoji: '⛓️',
    found: 'bg-sky-100 text-sky-800 border-sky-300 shadow-[0_0_0_1px_rgba(2,132,199,0.18)]',
    label: 'reason',
  },
  assumption: {
    emoji: '⛏️',
    found: 'bg-violet-100 text-violet-800 border-violet-300 shadow-[0_0_0_1px_rgba(109,40,217,0.18)]',
    label: 'assumption',
  },
  fallacy: {
    emoji: '⚡',
    found: 'bg-rose-100 text-rose-800 border-rose-300 shadow-[0_0_0_1px_rgba(225,29,72,0.18)]',
    label: 'fallacy',
  },
  omission: {
    emoji: '🕳️',
    found: 'bg-amber-100 text-amber-800 border-amber-300 shadow-[0_0_0_1px_rgba(180,118,15,0.18)]',
    label: 'omission',
  },
  ambiguous_term: {
    emoji: '💠',
    found: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 shadow-[0_0_0_1px_rgba(192,38,211,0.18)]',
    label: 'ambiguous',
  },
}

export const NODE_TYPE_LABELS: Record<NodeType, { zh: string; en: string }> = {
  conclusion: { zh: '结论', en: 'Conclusion' },
  reason: { zh: '理由', en: 'Reason' },
  assumption: { zh: '隐藏假设', en: 'Assumption' },
  fallacy: { zh: '逻辑谬误', en: 'Fallacy' },
  omission: { zh: '被遗漏的信息', en: 'Omission' },
  ambiguous_term: { zh: '歧义词', en: 'Ambiguous term' },
}
