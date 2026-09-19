// 引擎C 天平校准站 UI 文案（引擎自身文案，不走关卡 i18n）。
export const SCALE_UI = {
  zh: {
    objective: '🎯 校准：把滑块放到最能被这条陈述支持的位置',
    submit: '⚖️ 提交校准',
    reset: '重新校准',
    recorded: '✓ 已记录这次校准尝试；回到陈述检查定义与证据边界',
    submitHint: '先完成一次校准尝试，再提交',
    best: '最佳成绩',
    modeSpectrum: 'SPECTRUM · 词义光谱',
    modeConclusion: 'CONCLUSION · 结论区间',
    completeTitle: '⚖️ 校准完成！',
    completeSub: '你把标尺放在了最合理的位置',
    back: '返回章节',
  },
  en: {
    objective: '🎯 Calibrate: place the slider where the statement is best supported',
    submit: '⚖️ Submit',
    reset: 'Recalibrate',
    recorded: '✓ Calibration attempt recorded; revisit the claim, definitions, and evidence boundary',
    submitHint: 'Make one calibration attempt before submitting',
    best: 'Best score',
    modeSpectrum: 'SPECTRUM · MEANING CALIBRATION',
    modeConclusion: 'CONCLUSION · REASONABLE RANGE',
    completeTitle: '⚖️ Calibrated!',
    completeSub: 'You placed the scale at the most reasonable position',
    back: 'Back',
  },
} as const

export type ScaleUIDict = (typeof SCALE_UI)['zh']
