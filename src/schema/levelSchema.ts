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
