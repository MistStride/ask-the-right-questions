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
