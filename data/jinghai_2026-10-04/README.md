# Jinghai Huo, 2026-10-04: Section 3 (Population Segment Analysis) answer key, corrected

Supersedes `data/jinghai_2026-10-01/`. Jinghai found that the treatment he had given for the three
continuous Attitudes & Personality Traits constructs (Personal Resilience, Community Resilience,
Social Engagement) was wrong, which made their p_ate / ATE values unusually small. The corrected
treatment is a **one-unit increase from each respondent's current construct value**, consistent
with the paper. The earlier "+1% of SD" (coefficient x 0.01 x SD) and "+1 SD" rows are withdrawn.

Files
- `ATE_segments_by_model.xlsx`: his file, unchanged. 35 model sheets (event x activity) + `index`.
  38 rows per model: 35 discrete comparisons + 3 continuous constructs (previously 41 rows,
  because each construct had two shifts).
- `ATE_Calculation_10.4.ipynb`: his updated notebook (source of the numbers).
- `ATE_segments_by_model.csv`: the xlsx flattened (one row per sheet x comparison), 1,330 rows,
  so `src/lib/engine/ateSegmentAnswerKey.test.ts` can read it without an xlsx parser.
  Continuous rows are labelled base "Current value", comparison "1 Unit Increase*".

What changed vs 2026-10-01 (checked cell by cell)
- The 1,225 discrete rows are identical to the 2026-10-01 file.
- Section 2 (severity) is unaffected.
- Only the continuous rows changed: the shift is now `coefficient x 1.0` on the construct's own
  normalized scale (no SD), applied to each person's observed prediction. Values are roughly two
  orders of magnitude larger than before.
- `in_model` for the continuous rows is unchanged: 45 of 105 rows are in-model.

Implementation: `computeContinuousATE(..., { shift: 1 })` in `src/lib/engine/computeATE.ts`,
called from `src/hooks/useScenarioATE.ts`.
