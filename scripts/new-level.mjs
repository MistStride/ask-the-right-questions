#!/usr/bin/env node
// 关卡脚手架 CLI —— 一行命令生成新关卡模板（JSON + 双语 i18n）
//
// 用法：
//   npm run new-level                          # 交互式问答
//   npm run new-level -- xray 4                # 引擎 + 章节（其余默认）
//   npm run new-level -- courtroom 7 2 myname  # 引擎 章节 难度(1-3) 贡献者
//
// 引擎：xray | courtroom | scale | defusal | tamer
// 生成：src/content/levels/chapter-{NN}/level-{MM}.json + .i18n.json
// 说明：levelIndex 会自动扫描新关卡；填好文案后 `npm run build` 做 Zod 校验。
import { readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LEVELS_DIR = join(ROOT, 'src/content/levels')

const ENGINES = ['xray', 'courtroom', 'scale', 'defusal', 'tamer']

/* ---------- 各引擎模板 ---------- */
const TEMPLATES = {
  xray: {
    hint: 'scan 模式：在正文中找结论与理由。mode 可换 dig（挖假设）/ gap（找空洞），参考 chapter-05/11 现有关卡',
    json({ chapter, difficulty, contributor, levelId }) {
      return {
        levelId, chapter, engine: 'xray', difficulty, contributor,
        rewardTags: ['structure'], mode: 'scan',
        nodes: [
          { nodeId: 'conclusion_1', type: 'conclusion', textRef: 'conclusion_1' },
          { nodeId: 'reason_1', type: 'reason', textRef: 'reason_1' },
        ],
        distractors: [{ nodeId: 'distractor_1', type: 'ambiguous_term', textRef: 'distractor_1' }],
        steps: [
          { stepId: 's1', targets: ['conclusion_1'] },
          { stepId: 's2', targets: ['reason_1'] },
        ],
      }
    },
    i18n() {
      return {
        zh: {
          sourceText: '【正文：写一段包含结论与理由的论证。下方 textRefs 的锚点文本必须逐字出现在这里】',
          textRefs: {
            conclusion_1: '【结论句，须逐字出现在 sourceText】',
            reason_1: '【理由句，须逐字出现在 sourceText】',
            distractor_1: '【干扰项：正文里出现的其他句子，不是结论/理由】',
          },
          hints: ['先找结论：作者希望你接受什么主张？', '再找理由：什么依据支撑了这个结论？'],
          explanation: '【通关解析：为什么这些是结论与理由】',
        },
        en: {
          sourceText: '[Body text: write an argument with a conclusion and reasons. Anchor texts in textRefs must appear verbatim here]',
          textRefs: {
            conclusion_1: '[Conclusion sentence — must appear verbatim in sourceText]',
            reason_1: '[Reason sentence — must appear verbatim in sourceText]',
            distractor_1: '[Distractor: another sentence in the text that is not the conclusion/reason]',
          },
          hints: ['Find the conclusion first: what is the author asking you to accept?', 'Then find the reason: what supports the conclusion?'],
          explanation: '[Completion explanation: why these are the conclusion and reasons]',
        },
      }
    },
  },

  courtroom: {
    hint: 'trial 模式：证词里的破绽锚点必须逐字出现在 testimony 里。mode 可换 clinic（诊所）/ lineup（对质墙），参考 chapter-06/09 现有关卡',
    json({ chapter, difficulty, contributor, levelId }) {
      return {
        levelId, chapter, engine: 'courtroom', difficulty, contributor,
        rewardTags: ['evidence'], mode: 'trial', credibility: 100,
        weakSpots: [
          { spotId: 'spot_1', anchorTextRef: 'spot_1', issueType: 'expert_qualification', debunkRef: 'debunk_1', sharpness: 40 },
        ],
        questionBank: [
          { questionId: 'q_1', textRef: 'q_1', sharpness: 40, targetIssue: 'expert_qualification', isRelevant: true },
          { questionId: 'q_d1', textRef: 'q_d1', sharpness: 10, targetIssue: 'expert_qualification', isRelevant: false },
        ],
      }
    },
    i18n() {
      return {
        zh: {
          caseTitle: '【案件标题】',
          witnessName: '【证人名】',
          testimony: '【证词正文。spot_1 的锚点文本必须逐字出现在这里】',
          textRefs: {
            spot_1: '【破绽句，须逐字出现在 testimony】',
            debunk_1: '【击碎后的真相说明】',
            q_1: '【有效质询问题】',
            q_d1: '【无效质询问题（干扰项）】',
          },
          hints: ['【提示1：从证词的哪个薄弱处入手？】'],
          explanation: '【通关解析】',
        },
        en: {
          caseTitle: '[Case title]',
          witnessName: '[Witness name]',
          testimony: '[Testimony text. The spot_1 anchor must appear verbatim here]',
          textRefs: {
            spot_1: '[Weak spot sentence — must appear verbatim in testimony]',
            debunk_1: '[Truth revealed after the spot is broken]',
            q_1: '[Relevant cross-examination question]',
            q_d1: '[Irrelevant question (distractor)]',
          },
          hints: ['[Hint 1: which weakness should you attack?]'],
          explanation: '[Completion explanation]',
        },
      }
    },
  },

  scale: {
    hint: 'spectrum 模式：词义光谱上拖滑块到合理区间。mode 可换 conclusion（结论区间），参考 chapter-12 现有关卡',
    json({ chapter, difficulty, contributor, levelId }) {
      return {
        levelId, chapter, engine: 'scale', difficulty, contributor,
        rewardTags: ['structure'], mode: 'spectrum',
        idealRange: [40, 70], idealPoint: 55,
      }
    },
    i18n() {
      return {
        zh: {
          prompt: '【问题：某个模糊词到底落在光谱哪里？】',
          spectrumLabels: ['【左端词】', '【右端词】'],
          hints: ['【提示1：想想这个词的极端含义】'],
          explanation: '【通关解析：为什么这个区间是合理的】',
        },
        en: {
          prompt: '[Question: where does the ambiguous term fall on this spectrum?]',
          spectrumLabels: ['[Left label]', '[Right label]'],
          hints: ['[Hint 1: think of the extreme meanings]'],
          explanation: '[Completion explanation]',
        },
      }
    },
  },

  defusal: {
    hint: '数据拆弹：图表中藏陷阱。注意 yAxis 须 min < start < max；manualRefs 条数必须等于真陷阱数',
    json({ chapter, difficulty, contributor, levelId }) {
      return {
        levelId, chapter, engine: 'defusal', difficulty, contributor,
        rewardTags: ['data'],
        chartData: [
          { labelRef: 'bar_1', value: 50 },
          { labelRef: 'bar_2', value: 80 },
        ],
        yAxis: { min: 0, max: 100, start: 90 },
        suspectSpots: [
          { spotId: 'spot_trap', barIndex: 1, isTrap: true, debunkRef: 'debunk_trap' },
          { spotId: 'spot_dummy', barIndex: 0, isTrap: false },
        ],
        manualRefs: ['m_trap'],
      }
    },
    i18n() {
      return {
        zh: {
          chartTitle: '【图表标题】',
          labels: ['【柱1含义】', '【柱2含义】'],
          textRefs: { bar_1: '【柱1】', bar_2: '【柱2】', debunk_trap: '【陷阱真相】' },
          manual: ['【拆弹手册：如何识破这个陷阱】'],
          hints: ['【提示1：图表哪里被动了手脚？】'],
          explanation: '【通关解析】',
        },
        en: {
          chartTitle: '[Chart title]',
          labels: ['[Bar 1 meaning]', '[Bar 2 meaning]'],
          textRefs: { bar_1: '[Bar 1]', bar_2: '[Bar 2]', debunk_trap: '[The trap revealed]' },
          manual: ['[Manual: how to spot this trap]'],
          hints: ['[Hint 1: what was manipulated in this chart?]'],
          explanation: '[Completion explanation]',
        },
      }
    },
  },

  tamer: {
    hint: '驯兽场：冲动事件选项。correctOptionRef 必须在 optionRefs 中。mode tutorial（教程）/ boss（终章）',
    json({ chapter, difficulty, contributor, levelId }) {
      return {
        levelId, chapter, engine: 'tamer', difficulty, contributor,
        rewardTags: ['emotion'], mode: 'tutorial',
        scenarioRef: 'scenario', initialRage: 20, ragePerMiss: 20,
        impulseEvents: [
          {
            eventId: 'ev_1', biasType: 'jumping_to_conclusion',
            optionRefs: ['opt_bad', 'opt_ask', 'opt_other'],
            correctOptionRef: 'opt_ask',
          },
        ],
      }
    },
    i18n() {
      return {
        zh: {
          scenario: '【场景：一段让人产生冲动判断的对话/直播/帖子】',
          impulsePrompts: { ev_1: '【冲动气泡：此刻内心的想法】' },
          options: {
            opt_bad: '【干扰选项：顺着冲动的回应】',
            opt_ask: '【正确选项：批判性提问/检验】',
            opt_other: '【干扰选项：看似合理但没在检验】',
          },
          eventMeta: { ev_1: { calm: '【安抚后的解析】', biasLabel: '【对应认知偏差，如：跳到结论】' } },
          hints: ['【提示1：哪个回应在真正检验断言？】'],
          explanation: '【通关解析】',
        },
        en: {
          scenario: '[Scenario: a conversation/livestream/post that triggers a snap judgment]',
          impulsePrompts: { ev_1: '[Impulse bubble: what the gut says]' },
          options: {
            opt_bad: '[Distractor: an impulsive reply]',
            opt_ask: '[Correct: a critical question / test]',
            opt_other: '[Distractor: plausible but not testing]',
          },
          eventMeta: { ev_1: { calm: '[Explanation after calming]', biasLabel: '[Cognitive bias, e.g. Jumping to Conclusion]' } },
          hints: ['[Hint 1: which reply actually tests the claim?]'],
          explanation: '[Completion explanation]',
        },
      }
    },
  },
}

/* ---------- 工具 ---------- */
function nextLevelNumber(chapterDir) {
  if (!existsSync(chapterDir)) return 1
  const files = readdirSync(chapterDir).filter((f) => /^level-\d+\.json$/.test(f))
  if (files.length === 0) return 1
  const max = Math.max(...files.map((f) => parseInt(f.match(/level-(\d+)/)[1], 10)))
  return max + 1
}

function writeFiles(engine, chapter, difficulty, contributor, force) {
  const dir = join(LEVELS_DIR, `chapter-${String(chapter).padStart(2, '0')}`)
  const num = nextLevelNumber(dir)
  const levelId = `ch${String(chapter).padStart(2, '0')}-level${String(num).padStart(2, '0')}`
  const jsonPath = join(dir, `level-${String(num).padStart(2, '0')}.json`)
  const i18nPath = jsonPath.replace('.json', '.i18n.json')
  if (!force && (existsSync(jsonPath) || existsSync(i18nPath))) {
    console.error(`❌ 文件已存在：${jsonPath}`)
    return null
  }
  const tpl = TEMPLATES[engine]
  mkdirSync(dir, { recursive: true })
  writeFileSync(jsonPath, JSON.stringify(tpl.json({ chapter, difficulty, contributor, levelId }), null, 2) + '\n')
  writeFileSync(i18nPath, JSON.stringify(tpl.i18n(), null, 2) + '\n')
  return { levelId, jsonPath, i18nPath }
}

/* ---------- 主流程 ---------- */
async function main() {
  const args = process.argv.slice(2)
  let engine = args[0]
  let chapter = args[1] ? Number(args[1]) : NaN
  let difficulty = args[2] ? Number(args[2]) : 1
  let contributor = args[3] || 'atrq-team'

  if (!engine) {
    const rl = readline.createInterface({ input, output })
    const pick = await rl.question(
      `选择引擎 (${ENGINES.join(' / ')}): `,
    )
    engine = pick.trim().toLowerCase()
    chapter = Number(await rl.question('章节号 (1-13): '))
    difficulty = Number(await rl.question('难度 (1-3, 回车默认 1): ') || '1')
    contributor = (await rl.question(`贡献者 (回车默认 ${contributor}): `)).trim() || contributor
    rl.close()
  }

  if (!ENGINES.includes(engine)) {
    console.error(`❌ 引擎必须是：${ENGINES.join(' / ')}`)
    process.exit(1)
  }
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 13) {
    console.error('❌ 章节号必须是 1-13 的整数')
    process.exit(1)
  }
  if (![1, 2, 3].includes(difficulty)) {
    console.error('❌ 难度必须是 1/2/3')
    process.exit(1)
  }

  const out = writeFiles(engine, chapter, difficulty, contributor, false)
  if (!out) process.exit(1)

  console.log(`\n✅ 已生成关卡模板：${out.levelId}`)
  console.log(`   📄 ${out.jsonPath}`)
  console.log(`   🌐 ${out.i18nPath}`)
  console.log(`\n📌 ${TEMPLATES[engine].hint}`)
  console.log(`\n下一步：`)
  console.log(`  1. 在 .i18n.json 的 zh/en 里填入真实文案（锚点文本必须逐字出现在正文）`)
  console.log(`  2. npm run build   # Zod + 锚点校验，零错误即通过`)
  console.log(`  3. npm run dev     # 打开 http://localhost:5173/#/level/${out.levelId} 试玩`)
}

main().catch((e) => {
  console.error('异常:', e.message)
  process.exit(2)
})
