// 全书 13 章元数据（首页地图与章节页共用），来自《游戏化设计方案》的映射表。
import type { EngineType } from '../schema/levelTypes'

export interface ChapterMeta {
  id: number
  title: { zh: string; en: string }
  focus: { zh: string; en: string }
  engine: EngineType | null
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    title: { zh: '正确提问的益处和方法', en: 'The Benefit and Manner of Asking the Right Questions' },
    focus: { zh: '海绵式 vs 淘金式思维', en: 'Sponge vs. Panning-for-Gold' },
    engine: 'tamer',
  },
  {
    id: 2,
    title: { zh: '论题和结论是什么', en: 'What Are the Issue and the Conclusion?' },
    focus: { zh: '定位论题与结论', en: 'Locating issue & conclusion' },
    engine: 'xray',
  },
  {
    id: 3,
    title: { zh: '理由是什么', en: 'What Are the Reasons?' },
    focus: { zh: '理由 → 结论的支撑链', en: 'Reason–conclusion chains' },
    engine: 'xray',
  },
  {
    id: 4,
    title: { zh: '哪些词语意思不明确', en: 'What Words or Phrases Are Ambiguous?' },
    focus: { zh: '词义光谱校准', en: 'Ambiguity spectrum' },
    engine: 'scale',
  },
  {
    id: 5,
    title: { zh: '价值观假设和描述性假设是什么', en: 'What Are the Value and Descriptive Assumptions?' },
    focus: { zh: '挖掘隐藏假设', en: 'Unearthing hidden assumptions' },
    engine: 'xray',
  },
  {
    id: 6,
    title: { zh: '论证中有没有谬误', en: 'Are There Any Fallacies in the Reasoning?' },
    focus: { zh: '识别逻辑谬误', en: 'Spotting fallacies' },
    engine: 'courtroom',
  },
  {
    id: 7,
    title: { zh: '证据的效力：个人经历、证言与专家意见', en: 'How Good Is the Evidence: Experience, Testimonials, Expert Opinion?' },
    focus: { zh: '质询信源', en: 'Cross-examining sources' },
    engine: 'courtroom',
  },
  {
    id: 8,
    title: { zh: '证据的效力：个人观察和调查研究', en: 'How Good Is the Evidence: Personal Observation and Research?' },
    focus: { zh: '审计研究方法', en: 'Auditing research methods' },
    engine: 'courtroom',
  },
  {
    id: 9,
    title: { zh: '有没有替代原因', en: 'Are There Rival Causes?' },
    focus: { zh: '寻找替代解释', en: 'Hunting rival causes' },
    engine: 'courtroom',
  },
  {
    id: 10,
    title: { zh: '数据有没有欺骗性', en: 'How Deceptive Are the Statistics?' },
    focus: { zh: '识破统计陷阱', en: 'Defusing statistical traps' },
    engine: 'defusal',
  },
  {
    id: 11,
    title: { zh: '有什么重要信息被省略了', en: 'What Significant Information Is Omitted?' },
    focus: { zh: '发现信息空洞', en: 'Finding the missing pieces' },
    engine: 'xray',
  },
  {
    id: 12,
    title: { zh: '能得出哪些合理的结论', en: 'What Reasonable Conclusions Are Possible?' },
    focus: { zh: '结论合理区间', en: 'Reasonableness spectrum' },
    engine: 'scale',
  },
  {
    id: 13,
    title: { zh: '干扰批判性思维的障碍', en: 'What Obstacles Interfere with Critical Thinking?' },
    focus: { zh: '驯服思维障碍', en: 'Taming thinking obstacles' },
    engine: 'tamer',
  },
]

export const ENGINE_BADGES: Record<EngineType, { zh: string; en: string; icon: string }> = {
  xray: { zh: '论证透视镜', en: 'X-Ray Scanner', icon: '🔍' },
  courtroom: { zh: '逻辑法庭', en: 'Courtroom', icon: '⚖️' },
  scale: { zh: '天平校准站', en: 'Calibration', icon: '⚗️' },
  defusal: { zh: '数据拆弹', en: 'Defusal', icon: '🧨' },
  tamer: { zh: '心智驯兽场', en: 'Taming Arena', icon: '🐘' },
}
