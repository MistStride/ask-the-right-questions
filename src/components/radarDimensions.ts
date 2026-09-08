import type { RadarDimension } from '../schema/levelTypes'

export const RADAR_DIMENSIONS: {
  key: RadarDimension
  zh: string
  en: string
  icon: string
}[] = [
  { key: 'structure', zh: '结构识别力', en: 'Structure', icon: '🧱' },
  { key: 'evidence', zh: '证据鉴别力', en: 'Evidence', icon: '🔎' },
  { key: 'assumption', zh: '假设挖掘力', en: 'Assumption', icon: '⛏️' },
  { key: 'fallacy', zh: '谬误免疫力', en: 'Fallacy', icon: '🛡️' },
  { key: 'data', zh: '数据免疫力', en: 'Data', icon: '🧮' },
  { key: 'emotion', zh: '情绪自控力', en: 'Emotion', icon: '🐘' },
]
