import fs from 'fs';
import path from 'path';
const base = 'src/content/levels';
function lenZh(s) {
  if (!s) return 0;
  if (Array.isArray(s)) return s.reduce((a, x) => a + lenZh(x), 0);
  return [...String(s)].filter((c) => /[一-鿿]/.test(c)).length;
}
const rows = [];
for (const ch of fs.readdirSync(base)) {
  const cp = path.join(base, ch);
  if (!fs.statSync(cp).isDirectory()) continue;
  for (const f of fs.readdirSync(cp)) {
    if (!f.endsWith('.json') || f.includes('.i18n')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(cp, f), 'utf8'));
    const i18n = JSON.parse(fs.readFileSync(path.join(cp, f.replace('.json', '.i18n.json')), 'utf8'));
    const zh = i18n.zh || {};
    const engine = d.engine;
    const diff = d.difficulty ?? '?';
    const mode = d.mode || '-';
    let passage = 0;
    if (engine === 'xray') passage = lenZh(zh.sourceText);
    else if (engine === 'courtroom') passage = lenZh(zh.testimony) + lenZh(zh.caseTitle) + lenZh(zh.witnessName);
    else if (engine === 'defusal') passage = lenZh(zh.chartTitle) + lenZh(zh.labels) + lenZh(zh.textRefs);
    else if (engine === 'scale') passage = lenZh(zh.prompt) + lenZh(zh.spectrumLabels);
    else if (engine === 'tamer') passage = lenZh(zh.scenario) + lenZh(zh.options) + lenZh(zh.impulses);
    // interactive elements
    let spots = 0;
    if (engine === 'xray') spots = (d.nodes?.length || 0) + (d.distractors?.length || 0);
    else if (engine === 'courtroom') spots = (d.weakSpots?.length || 0) + (d.questionBank?.length || 0);
    else if (engine === 'defusal') spots = (d.suspectSpots?.length || 0) + (d.chartData?.length || 0);
    else if (engine === 'scale') spots = 1;
    else if (engine === 'tamer') spots = d.impulseEvents?.length || 0;
    const hints = (zh.hints?.length || 0);
    const expl = lenZh(zh.explanation);
    rows.push({ id: ch + '/' + f.replace('.json', ''), engine, diff, mode, passage, spots, hints, expl });
  }
}
rows.sort((a, b) => a.id.localeCompare(b.id));
let pTot = 0, pMax = 0, pMin = 1e9;
for (const r of rows) {
  pTot += r.passage;
  pMax = Math.max(pMax, r.passage);
  pMin = Math.min(pMin, r.passage);
  console.log(
    r.id.padEnd(22) +
      ' ' +
      r.engine.padEnd(10) +
      ' D' +
      r.diff +
      ' ' +
      r.mode.padEnd(9) +
      ' 正文=' +
      String(r.passage).padStart(4) +
      ' 元素=' +
      String(r.spots).padStart(2) +
      ' 提示=' +
      r.hints +
      ' 解析=' +
      r.expl,
  );
}
console.log('\n=== 汇总 ===');
console.log('关数:', rows.length, ' 正文总字数:', pTot, ' 平均:', Math.round(pTot / rows.length), ' 最长:', pMax, ' 最短:', pMin);
// by difficulty
const byD = {};
for (const r of rows) {
  byD[r.diff] ||= { n: 0, p: 0 };
  byD[r.diff].n++;
  byD[r.diff].p += r.passage;
}
console.log('--- 按 difficulty 分桶（看难度是否随文本量上升）---');
for (const k of Object.keys(byD).sort()) console.log('  D' + k + '  n=' + byD[k].n + '  平均正文=' + Math.round(byD[k].p / byD[k].n));
const byE = {};
for (const r of rows) {
  byE[r.engine] ||= { n: 0, p: 0, s: 0 };
  byE[r.engine].n++;
  byE[r.engine].p += r.passage;
  byE[r.engine].s += r.spots;
}
console.log('--- 按引擎 ---');
for (const e in byE) console.log('  ' + e.padEnd(10) + ' n=' + byE[e].n + ' 平均正文=' + Math.round(byE[e].p / byE[e].n) + ' 平均元素=' + Math.round(byE[e].s / byE[e].n));
