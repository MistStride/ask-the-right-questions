import fs from 'fs';
import path from 'path';
const base = 'src/content/levels';
let bad = 0;
for (const ch of fs.readdirSync(base)) {
  const cp = path.join(base, ch);
  if (!fs.statSync(cp).isDirectory()) continue;
  for (const f of fs.readdirSync(cp)) {
    if (!f.endsWith('.json') || f.includes('.i18n')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(cp, f), 'utf8'));
    if (d.engine !== 'xray') continue;
    const validKeys = new Set([
      ...(d.nodes || []).map((n) => n.textRef),
      ...(d.distractors || []).map((n) => n.textRef),
    ]);
    const hasGap = (d.gaps && d.gaps.length) || (d.mode === 'gap');
    const i18n = JSON.parse(fs.readFileSync(path.join(cp, f.replace('.json', '.i18n.json')), 'utf8'));
    for (const loc of ['zh', 'en']) {
      const src = i18n[loc].sourceText || '';
      const refs = i18n[loc].textRefs || {};
      // 1) 主 JSON 引用的锚点必须能在 sourceText 中找到
      for (const k of validKeys) {
        if (!refs[k]) { bad++; console.log(`[缺失] ${ch}/${f} (${loc}) textRefs 缺少键 "${k}"`); continue; }
        if (!src.includes(refs[k])) { bad++; console.log(`[子串] ${ch}/${f} (${loc}) textRef "${k}" 不在 sourceText:\n   -> ${refs[k]}`); }
      }
      // 2) i18n 里多出来的键：gap 模式允许（正确答案在 gapRefs），scan/dig 不允许
      for (const k of Object.keys(refs)) {
        if (!validKeys.has(k) && !hasGap) { bad++; console.log(`[孤儿] ${ch}/${f} (${loc}) textRefs 键 "${k}" 未在主 JSON 节点/干扰项中引用`); }
      }
    }
    // 3) gap 模式：gaps 的 correctTextRef 必须在 gapRefs 有对应选项
    if (hasGap && d.gaps) {
      for (const loc of ['zh', 'en']) {
        const gapRefs = i18n[loc].gapRefs || {};
        for (const g of d.gaps) {
          const opts = gapRefs[g.gapId];
          if (!opts || !opts.includes(i18n[loc].textRefs[g.correctTextRef])) {
            bad++; console.log(`[gap] ${ch}/${f} (${loc}) gap ${g.gapId} 正确项不在候选数组中`);
          }
        }
      }
    }
  }
}
console.log(bad === 0 ? 'OK: 锚点一致性全部通过（子串 + 键映射 + gap 候选）' : `\n发现 ${bad} 处问题`);
process.exit(bad === 0 ? 0 : 1);
