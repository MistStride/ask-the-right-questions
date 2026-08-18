// 关卡数据的 Zod 运行时校验。
// 社区贡献者新增 JSON 关卡时，若字段不合法，会在开发/构建期看到清晰报错。
import { z } from 'zod'

export const radarDimensionSchema = z.enum([
  'structure',
  'evidence',
  'assumption',
  'fallacy',
  'data',
  'emotion',
])

export const nodeTypeSchema = z.enum([
  'conclusion',
  'reason',
  'assumption',
  'fallacy',
  'omission',
  'ambiguous_term',
])

export const xrayNodeRefSchema = z.object({
  nodeId: z.string().min(1, 'nodeId 不能为空'),
  type: nodeTypeSchema,
  textRef: z.string().min(1, 'textRef 不能为空'),
  hidden: z.boolean().optional(),
})

export const xrayGapRefSchema = z.object({
  gapId: z.string().min(1, 'gapId 不能为空'),
  correctTextRef: z.string().min(1, 'correctTextRef 不能为空'),
})

export const xrayStepRefSchema = z.object({
  stepId: z.string().min(1, 'stepId 不能为空'),
  targets: z.array(z.string().min(1)).min(1, '每步至少一个目标'),
})

export const xrayLevelSchema = z.object({
  levelId: z.string().min(1, 'levelId 不能为空'),
  chapter: z.number().int().min(1).max(13, 'chapter 需在 1-13 之间'),
  engine: z.literal('xray'),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  contributor: z.string().optional(),
  rewardTags: z.array(radarDimensionSchema),
  mode: z.enum(['scan', 'dig', 'gap']).optional(),
  nodes: z.array(xrayNodeRefSchema).min(1, '至少需要一个正确节点'),
  distractors: z.array(xrayNodeRefSchema).default([]),
  correctChain: z
    .array(z.object({ from: z.string().min(1), to: z.string().min(1) }))
    .optional(),
  gaps: z.array(xrayGapRefSchema).optional(),
  steps: z.array(xrayStepRefSchema).optional(),
})

export const xrayTextsSchema = z.object({
  sourceText: z.string().min(1, 'sourceText 不能为空'),
  textRefs: z.record(z.string(), z.string().min(1, 'textRef 对应的文案不能为空')),
  gapRefs: z.record(z.string(), z.array(z.string().min(1))).optional(),
  hints: z.array(z.string()),
  explanation: z.string().min(1, 'explanation 不能为空'),
})

export const levelTextsSchema = z.object({
  zh: xrayTextsSchema,
  en: xrayTextsSchema,
})

export type XrayLevelDataParsed = z.infer<typeof xrayLevelSchema>
export type XrayTextsParsed = z.infer<typeof xrayTextsSchema>

/* ---------------- 引擎B 逻辑法庭 ---------------- */

export const courtroomModeSchema = z.enum(['trial', 'clinic', 'lineup'])

export const courtroomWeakSpotSchema = z.object({
  spotId: z.string().min(1, 'spotId 不能为空'),
  anchorTextRef: z.string().min(1, 'anchorTextRef 不能为空'),
  issueType: z.string().min(1, 'issueType 不能为空'),
  debunkRef: z.string().min(1, 'debunkRef 不能为空'),
  sharpness: z.number().int().min(1).max(100, 'sharpness 需在 1-100'),
})

export const courtroomQuestionSchema = z.object({
  questionId: z.string().min(1, 'questionId 不能为空'),
  textRef: z.string().min(1, 'textRef 不能为空'),
  sharpness: z.number().int().min(1).max(100),
  targetIssue: z.string().min(1, 'targetIssue 不能为空'),
  isRelevant: z.boolean(),
})

export const courtroomLevelSchema = z.object({
  levelId: z.string().min(1, 'levelId 不能为空'),
  chapter: z.number().int().min(1).max(13, 'chapter 需在 1-13 之间'),
  engine: z.literal('courtroom'),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  contributor: z.string().optional(),
  rewardTags: z.array(radarDimensionSchema),
  mode: courtroomModeSchema.optional(),
  // 注意：testimony 证词文案在 i18n 文件里（语言相关），逻辑文件不含
  credibility: z.number().int().min(1).max(100).default(100),
  weakSpots: z.array(courtroomWeakSpotSchema).min(1, '至少需要一个破绽'),
  questionBank: z.array(courtroomQuestionSchema).min(1, '至少需要一个问题'),
})

export const courtroomTextsSchema = z.object({
  caseTitle: z.string().min(1, 'caseTitle 不能为空'),
  witnessName: z.string().min(1, 'witnessName 不能为空'),
  testimony: z.string().min(1, 'testimony 不能为空'),
  textRefs: z.record(z.string(), z.string().min(1, 'textRef 对应的文案不能为空')),
  hints: z.array(z.string()),
  explanation: z.string().min(1, 'explanation 不能为空'),
})

/** 法庭关卡的翻译包：zh/en 双语 */
export const courtroomLevelTextsSchema = z.object({
  zh: courtroomTextsSchema,
  en: courtroomTextsSchema,
})

export type CourtroomLevelDataParsed = z.infer<typeof courtroomLevelSchema>
export type CourtroomTextsParsed = z.infer<typeof courtroomLevelTextsSchema>

/* ---------------- 引擎C 天平校准站 ---------------- */

export const scaleModeSchema = z.enum(['spectrum', 'conclusion'])

export const scaleLevelSchema = z.object({
  levelId: z.string().min(1, 'levelId 不能为空'),
  chapter: z.number().int().min(1).max(13, 'chapter 需在 1-13 之间'),
  engine: z.literal('scale'),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  contributor: z.string().optional(),
  rewardTags: z.array(radarDimensionSchema),
  mode: scaleModeSchema.optional(),
  idealRange: z.tuple([z.number().min(0).max(100), z.number().min(0).max(100)]).refine(
    ([min, max]) => min < max,
    { message: 'idealRange 需满足 min < max' },
  ),
  idealPoint: z.number().min(0).max(100),
}).superRefine((data, ctx) => {
  const [min, max] = data.idealRange
  if (data.idealPoint < min || data.idealPoint > max) {
    ctx.addIssue({
      code: 'custom',
      path: ['idealPoint'],
      message: `idealPoint ${data.idealPoint} 必须落在 idealRange [${min}, ${max}] 内`,
    })
  }
})

export const scaleTextsSchema = z.object({
  prompt: z.string().min(1, 'prompt 不能为空'),
  spectrumLabels: z.tuple([z.string().min(1), z.string().min(1)]),
  hints: z.array(z.string()),
  explanation: z.string().min(1, 'explanation 不能为空'),
})

export const scaleLevelTextsSchema = z.object({
  zh: scaleTextsSchema,
  en: scaleTextsSchema,
})

export type ScaleLevelDataParsed = z.infer<typeof scaleLevelSchema>
export type ScaleTextsParsed = z.infer<typeof scaleLevelTextsSchema>

/* ---------------- 引擎D 数据拆弹 ---------------- */

export const defusalSpotSchema = z.object({
  spotId: z.string().min(1, 'spotId 不能为空'),
  barIndex: z.number().int().min(0),
  isTrap: z.boolean(),
  debunkRef: z.string().optional(),
})

export const defusalLevelSchema = z.object({
  levelId: z.string().min(1, 'levelId 不能为空'),
  chapter: z.number().int().min(1).max(13, 'chapter 需在 1-13 之间'),
  engine: z.literal('defusal'),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  contributor: z.string().optional(),
  rewardTags: z.array(radarDimensionSchema),
  chartData: z.array(z.object({ labelRef: z.string().min(1), value: z.number().finite() })).min(1, '至少需要一根柱'),
  yAxis: z.object({
    min: z.number().finite(),
    max: z.number().finite(),
    start: z.number().finite(),
  }).refine((y) => y.min < y.start && y.start < y.max, {
    message: 'yAxis 需满足 min < start < max（start 是动手脚的显示起点）',
  }),
  suspectSpots: z.array(defusalSpotSchema).min(1, '至少需要一个可疑点'),
  manualRefs: z.array(z.string().min(1)).min(1, '至少需要一条拆弹手册'),
}).superRefine((data, ctx) => {
  for (const s of data.suspectSpots) {
    if (s.barIndex >= data.chartData.length) {
      ctx.addIssue({ code: 'custom', path: ['suspectSpots'], message: `可疑点 ${s.spotId} 的 barIndex ${s.barIndex} 超出柱数` })
    }
    if (s.isTrap && !s.debunkRef) {
      ctx.addIssue({ code: 'custom', path: ['suspectSpots'], message: `陷阱 ${s.spotId} 必须提供 debunkRef` })
    }
  }
  if (!data.suspectSpots.some((s) => s.isTrap)) {
    ctx.addIssue({ code: 'custom', path: ['suspectSpots'], message: '至少需要一个真陷阱（isTrap: true）' })
  }
  if (data.manualRefs.length !== data.suspectSpots.filter((s) => s.isTrap).length) {
    ctx.addIssue({ code: 'custom', path: ['manualRefs'], message: '拆弹手册条目数必须等于陷阱数（逐条对应）' })
  }
})

export const defusalTextsSchema = z.object({
  chartTitle: z.string().min(1, 'chartTitle 不能为空'),
  labels: z.array(z.string().min(1)).min(1),
  textRefs: z.record(z.string(), z.string().min(1, 'textRef 对应的文案不能为空')),
  manual: z.array(z.string().min(1)).min(1),
  hints: z.array(z.string()),
  explanation: z.string().min(1, 'explanation 不能为空'),
})

export const defusalLevelTextsSchema = z.object({
  zh: defusalTextsSchema,
  en: defusalTextsSchema,
})

export type DefusalLevelDataParsed = z.infer<typeof defusalLevelSchema>
export type DefusalTextsParsed = z.infer<typeof defusalLevelTextsSchema>
