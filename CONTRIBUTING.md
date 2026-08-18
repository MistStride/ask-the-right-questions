# Contributing to Asking the Right Questions

Thanks for helping build a critical-thinking training game! The whole project is
**content-driven**: engines are generic, and all gameplay comes from level JSON files.
Most contributions are just "write good JSON" — no engine code needed.

**Read first:** `design/HANDOFF.md` (engineering rules) and `design/ROADMAP.md` (roadmap).

---

## 🚀 Quick start

```bash
npm install        # install dependencies
npm run dev        # start dev server at http://localhost:5173
npm run new-level  # generate a level template (interactive)
```

- The app uses **hash routing** — levels live at `http://localhost:5173/#/level/<levelId>`.
- Build (with full Zod + anchor validation): `npm run build` — **must pass with zero errors**.

---

## 📦 Adding a level (the most common contribution)

**The easy way — use the scaffold CLI:**

```bash
npm run new-level                      # interactive
npm run new-level -- xray 4            # engine + chapter, rest defaults
npm run new-level -- courtroom 7 2 you # engine chapter difficulty contributor
```

This creates two files under `src/content/levels/chapter-<NN>/`:

| File | Purpose |
|---|---|
| `level-<MM>.json` | Logic only (no language): nodes, spots, answers, ranges |
| `level-<MM>.i18n.json` | All text, bilingual: `zh` + `en` |

Then fill in real content and validate:

1. Replace the `【...】` placeholders in `.i18n.json` (both `zh` and `en`).
2. **Anchor rule:** any anchor text (e.g. courtroom `spot_1`, xray `conclusion_1`)
   must appear **verbatim** inside the body text (`testimony` / `sourceText`).
3. Run `npm run build` — Zod validates your level. Zero errors = good to go.
4. Playtest at `http://localhost:5173/#/level/<levelId>`.

**The 5 engines** (copy an existing level from the same engine for reference):

| Engine | Chapter examples | What the player does |
|---|---|---|
| `xray` | 2/3/5/11 | Find conclusion & reasons (`scan`), dig assumptions (`dig`), spot missing info (`gap`) |
| `courtroom` | 6/7/8/9 | Attack weak spots in testimony (`trial` / `clinic` / `lineup`) |
| `scale` | 4/12 | Drag a slider onto a reasonable range (`spectrum` / `conclusion`) |
| `defusal` | 10 | Find traps in a chart; `manualRefs` count must equal trap count |
| `tamer` | 1/13 | Choose the critical question over the impulsive reply |

Level numbering is automatic; `levelIndex.ts` auto-discovers everything you add.

---

## 🌐 Contributing translations

Levels are bilingual (`zh` + `en`). You can improve either side:

- **Fixing a mistranslation** → just edit the `.i18n.json` file and open a PR.
- **Adding a new language** → raise an issue first; the schema currently hard-codes `zh`/`en`.

Note: `en` translations don't need to be literal — they need to *feel* natural in English
while keeping the same judgment logic (anchors must still appear verbatim).

---

## ⚖️ Difficulty calibration

Play a level and feel it's too easy/hard? File an issue with:

1. Level ID (e.g. `ch07-level02`)
2. What felt off (too obvious distractors? options all look the same?)
3. Suggested change (swap a distractor, add a pseudo-question, adjust `sharpness`…)

See the difficulty-upgrade precedent for the `tamer` engine (ch13): we replaced
"obviously wrong" options with **plausible-looking** ones and added rhetorical
pseudo-questions that *look* like questions but already assume an answer.

---

## 🐛 Bug reports

Use the bug report issue template. Include:

- Level ID or page URL (e.g. `https://.../#/level/ch07-level01`)
- What you expected vs what happened
- Browser + OS
- Console errors, if any

---

## ✅ PR checklist

- [ ] `npm run build` passes with **zero errors** (this runs Zod + anchor validation)
- [ ] Level JSON has no language; all text lives in `.i18n.json`
- [ ] Both `zh` and `en` filled in
- [ ] Anchors appear verbatim in body text
- [ ] Playtested in `npm run dev`

---

## 🔒 Engineering rules (non-negotiable)

1. **Content & engine separation** — adding a level never touches engine code.
2. **Logic & text decoupling** — `.json` has no language; `.i18n.json` has no judgment.
3. **Semantic anchors** — find text by *snippet*, not character offsets.
4. **Zod validates everything** — a typo fails the build, loudly.
5. **New engine = 4 files** — types + schema + `engines/<name>/` + `LevelPage` dispatch case.
6. **Acceptance = visible in the browser** — if you can't see it, it's not done.

Questions? Open an issue — maintainers (and the book *Asking the Right Questions*
by Neil Browne & Stuart Keeley) have opinions.
