// 全书 13 章元数据（首页地图与章节页共用），来自《学会提问》(Asking the Right Questions) 原书 13 章映射。
import type { EngineType } from '../schema/levelTypes'

export interface ChapterMeta {
  id: number
  title: { zh: string; en: string }
  focus: { zh: string; en: string }
  engine: EngineType | null
  // 知识教学卡：把本章重新接回《学会提问》原书，进入关卡前展示。
  teaching: { zh: string; en: string }
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    title: { zh: '正确提问的益处和方法', en: 'The Benefit and Manner of Asking the Right Questions' },
    focus: { zh: '海绵式 vs 淘金式思维', en: 'Sponge vs. Panning-for-Gold' },
    engine: 'tamer',
    teaching: {
      zh: '书里区分两种思维：海绵式（大量吸收、不加评判）与淘金式（主动提问、在倾听中筛选）。本书要你养成淘金式习惯——面对任何观点，先问「我该不该接受」。为什么重要：从不提问的人，只是别人结论的容器。',
      en: "The book contrasts sponge thinking (absorbing passively) with panning-for-gold thinking (asking questions, evaluating as you listen). It wants you to build the gold-panning habit: before accepting any claim, ask 'should I believe this?' Why it matters: those who never question become mere containers for others' conclusions.",
    },
  },
  {
    id: 2,
    title: { zh: '论题和结论是什么', en: 'What Are the Issue and the Conclusion?' },
    focus: { zh: '定位论题与结论', en: 'Locating issue & conclusion' },
    engine: 'xray',
    teaching: {
      zh: '书的标准：结论是作者想让你接受的陈述（常跟在「因此/所以/由此可见」后）；论题是引发讨论的问题，分描述性（是不是事实）与规定性（该不该做）。先找结论，理由才有评判对象。为什么重要：找不到结论，后面的理由、证据都无从评起。',
      en: "The book's test: a conclusion is the statement the author wants you to accept (often after 'therefore/thus/so'); the issue is the question at stake — descriptive ('is it true?') or prescriptive ('should we?'). Find the conclusion first; only then can reasons be judged. Why it matters: without the conclusion, there is nothing to evaluate.",
    },
  },
  {
    id: 3,
    title: { zh: '理由是什么', en: 'What Are the Reasons?' },
    focus: { zh: '理由 → 结论的支撑链', en: 'Reason–conclusion chains' },
    engine: 'xray',
    teaching: {
      zh: '理由是结论的支撑（「因为…」），不是重复结论，也不只是例子本身。书提醒：结论能成立，前提是它「站在理由肩上」。为什么重要：没有理由的结论只是主张；判断理由是否成立，比同意结论更关键。',
      en: "Reasons are the support for a conclusion ('because…') — not a restatement of it, not merely an example. The book reminds us: a conclusion stands only on the shoulders of its reasons. Why it matters: a conclusion without reasons is just an assertion; judging the reasons matters more than agreeing with the verdict.",
    },
  },
  {
    id: 4,
    title: { zh: '哪些词语意思不明确', en: 'What Words or Phrases Are Ambiguous?' },
    focus: { zh: '词义光谱校准', en: 'Ambiguity spectrum' },
    engine: 'scale',
    teaching: {
      zh: '歧义＝一个词在同一语境里有多种合理理解。书的方法：找出关键词，问「它到底指什么」，把模糊词换成具体定义再判断。为什么重要：很多争论，其实是用同一个词在说不同的事。',
      en: "Ambiguity: a word with more than one reasonable meaning in context. The book's method: spot the key term, ask 'what exactly does it mean here,' then re-test the claim with a precise definition. Why it matters: many disputes are really two different things wearing the same word.",
    },
  },
  {
    id: 5,
    title: { zh: '价值观假设和描述性假设是什么', en: 'What Are the Value and Descriptive Assumptions?' },
    focus: { zh: '挖掘隐藏假设', en: 'Unearthing hidden assumptions' },
    engine: 'xray',
    teaching: {
      zh: '假设是作者没说出口、却撑起论证的前提。价值观假设＝「什么更值得追求」（如自由 vs 安全）；描述性假设＝对世界「是什么样」的信念。为什么重要：你不同意某个结论时，往往是因为你不同意它的隐藏假设。',
      en: "Assumptions are unstated premises that hold the argument up. Value assumptions are about what's worth pursuing (freedom vs. safety); descriptive assumptions are beliefs about how the world is. Why it matters: when you reject a conclusion, it's usually the hidden assumption you're rejecting.",
    },
  },
  {
    id: 6,
    title: { zh: '论证中有没有谬误', en: 'Are There Any Fallacies in the Reasoning?' },
    focus: { zh: '识别逻辑谬误', en: 'Spotting fallacies' },
    engine: 'courtroom',
    teaching: {
      zh: '谬误是「看起来有理、其实不成立」的推理。书列了典型：人身攻击、诉诸群众/权威/情感、滑坡、稻草人等。为什么重要：谬误用情绪代替证据，识别它，你才不会被带节奏。',
      en: "A fallacy is reasoning that looks valid but isn't. The book lists typical ones: ad hominem, appeal to popularity/authority/emotion, slippery slope, straw man. Why it matters: fallacies substitute feeling for evidence — spot them and you stop being swept along.",
    },
  },
  {
    id: 7,
    title: { zh: '证据的效力：个人经历、证言与专家意见', en: 'How Good Is the Evidence: Experience, Testimonials, Expert Opinion?' },
    focus: { zh: '质询信源', en: 'Cross-examining sources' },
    engine: 'courtroom',
    teaching: {
      zh: '书把证据分强弱：个人经历和证言最弱（个案≠规律），专家意见要看是否利益相关、是否越界。为什么重要：「我朋友试过有效」几乎从不能证明一个主张普遍成立。',
      en: "The book ranks evidence by strength: personal experience and testimonials are weakest (one case ≠ a pattern); expert opinion depends on conflicts of interest and whether the expert strays outside their field. Why it matters: 'a friend tried it and it worked' rarely proves a claim generally.",
    },
  },
  {
    id: 8,
    title: { zh: '证据的效力：个人观察和调查研究', en: 'How Good Is the Evidence: Personal Observation and Research?' },
    focus: { zh: '审计研究方法', en: 'Auditing research methods' },
    engine: 'courtroom',
    teaching: {
      zh: '观察会被期待和错觉扭曲；研究要看样本、测量、是否有对照与发表偏差。书的标准：能重复、方法透明的研究才可信。为什么重要：「有研究说」三个字，本身不证明任何事。',
      en: "Observation is distorted by expectations and illusion; research must be judged by sample, measurement, controls, and publication bias. The book's standard: only replicable, transparently conducted studies earn trust. Why it matters: 'studies show' proves nothing by itself.",
    },
  },
  {
    id: 9,
    title: { zh: '有没有替代原因', en: 'Are There Rival Causes?' },
    focus: { zh: '寻找替代解释', en: 'Hunting rival causes' },
    engine: 'courtroom',
    teaching: {
      zh: '看到一个因果，先问「还有别的原因吗」。书提醒：相关性≠因果，同一结果常有多个合理解释。为什么重要：急着认定唯一原因，会漏掉真正起作用的因素。',
      en: "Given a cause-and-effect claim, ask 'what else could explain it?' The book warns: correlation isn't causation, and one outcome often has several plausible causes. Why it matters: rushing to a single cause hides what really drove the result.",
    },
  },
  {
    id: 10,
    title: { zh: '数据有没有欺骗性', en: 'How Deceptive Are the Statistics?' },
    focus: { zh: '识破统计陷阱', en: 'Defusing statistical traps' },
    engine: 'defusal',
    teaching: {
      zh: '书拆穿常见统计陷阱：平均数掩盖分布、百分比缺基数、绝对值与相对值偷换、遗漏关键分母。为什么重要：同一个数，换个算法就能讲出相反的故事。',
      en: "The book exposes common statistical traps: averages hiding the spread, percentages without a base rate, absolute-vs-relative swaps, and missing denominators. Why it matters: the same number can tell opposite stories depending on how it's computed.",
    },
  },
  {
    id: 11,
    title: { zh: '有什么重要信息被省略了', en: 'What Significant Information Is Omitted?' },
    focus: { zh: '发现信息空洞', en: 'Finding the missing pieces' },
    engine: 'xray',
    teaching: {
      zh: '任何论证都只给你部分事实。书的方法：主动想「要下结论，我还缺什么」——反面案例、长期后果、适用边界。为什么重要：只看到对方想让你看的，判断就已先被框定。',
      en: "Every argument shows only part of the facts. The book's method: actively ask 'what would I need to know to decide?' — counter-cases, long-term effects, boundaries of applicability. Why it matters: if you see only what the speaker wants, your judgment is already framed.",
    },
  },
  {
    id: 12,
    title: { zh: '能得出哪些合理的结论', en: 'What Reasonable Conclusions Are Possible?' },
    focus: { zh: '结论合理区间', en: 'Reasonableness spectrum' },
    engine: 'scale',
    teaching: {
      zh: '书反对非此即彼：同一证据常支持一个「合理区间」的结论。方法：列出多种可能，标明每种成立的条件。为什么重要：急着下唯一结论，会低估不确定性、错判风险。',
      en: "The book rejects either/or thinking: the same evidence often supports a range of reasonable conclusions. Method: list the possibilities and state the conditions under which each holds. Why it matters: rushing to one verdict underestimates uncertainty and misprices risk.",
    },
  },
  {
    id: 13,
    title: { zh: '干扰批判性思维的障碍', en: 'What Obstacles Interfere with Critical Thinking?' },
    focus: { zh: '驯服思维障碍', en: 'Taming thinking obstacles' },
    engine: 'tamer',
    teaching: {
      zh: '书收尾谈「为什么我们常常不思考」：确认偏误、一厢情愿、刻板印象、被身份裹挟等。为什么重要：知道障碍在哪，才能在它出现时叫停自己。',
      en: "The book closes by asking why we often don't think: confirmation bias, wishful thinking, stereotypes, identity capture. Why it matters: naming the obstacle is the first step to catching yourself when it appears.",
    },
  },
]

export const ENGINE_BADGES: Record<EngineType, { zh: string; en: string; icon: string }> = {
  xray: { zh: '论证透视镜', en: 'X-Ray Scanner', icon: '🔍' },
  courtroom: { zh: '逻辑法庭', en: 'Courtroom', icon: '⚖️' },
  scale: { zh: '天平校准站', en: 'Calibration', icon: '⚗️' },
  defusal: { zh: '数据拆弹', en: 'Defusal', icon: '🧨' },
  tamer: { zh: '心智驯兽场', en: 'Taming Arena', icon: '🐘' },
}
