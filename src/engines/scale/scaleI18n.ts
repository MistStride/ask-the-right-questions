// 引擎C 天平校准站 UI 文案（引擎自身文案，不走关卡 i18n）。
export const SCALE_UI = {
  zh: {
    objective: '🎯 校准：把滑块放到最合理的位置——离中心越近分越高',
    submit: '⚖️ 提交校准',
    reset: '重新校准',
    hit: '✓ 落在合理区！精度',
    missLeft: '✗ 偏左了，合理区在更右的位置',
    missRight: '✗ 偏右了，合理区在更左的位置',
    submitHint: '先让滑块落入合理区一次，才能提交',
    best: '最佳成绩',
    modeSpectrum: 'SPECTRUM · 词义光谱',
    modeConclusion: 'CONCLUSION · 结论区间',
    heatLabel: '接近度',
    completeTitle: '⚖️ 校准完成！',
    completeSub: '你把标尺放在了最合理的位置',
    back: '返回章节',
  },
  en: {
    objective: '🎯 Calibrate: place the slider at the most reasonable position — closer to center scores higher',
    submit: '⚖️ Submit',
    reset: 'Recalibrate',
    hit: '✓ In the reasonable range! Accuracy',
    missLeft: '✗ Too far left — the reasonable range sits further right',
    missRight: '✗ Too far right — the reasonable range sits further left',
    submitHint: 'Land inside the reasonable range once before submitting',
    best: 'Best score',
    modeSpectrum: 'SPECTRUM · MEANING CALIBRATION',
    modeConclusion: 'CONCLUSION · REASONABLE RANGE',
    heatLabel: 'Closeness',
    completeTitle: '⚖️ Calibrated!',
    completeSub: 'You placed the scale at the most reasonable position',
    back: 'Back',
  },
} as const

export type ScaleUIDict = (typeof SCALE_UI)['zh']
