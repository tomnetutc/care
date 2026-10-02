# Jinghai Huo, 2026-10-01: Section 3 (Population Segment Analysis) answer key

`ATE_segments_by_model.xlsx` is Jinghai's file, unchanged: one sheet per event x activity model
(35) plus an `index` sheet. Each model sheet has 41 rows (35 discrete comparisons + PR/CR/SE at
"+1% of SD" and "+1 SD"), with `in_model`, P_base, P_comp, ATE_abs and ATE_pct for Do less /
About the same / Do more.

`ATE_segments_by_model.csv` is the same data flattened (one row per sheet x comparison) so the
Jest test `src/lib/engine/ateSegmentAnswerKey.test.ts` can read it without an xlsx parser.
Generated mechanically from the xlsx; no values edited.

Notes that shaped the implementation (see segmentConfig.ts):
- `in_model` is per comparison: FALSE when none of the variables that differ between base and
  comparison is a coefficient of that model (e.g. Age 31-50 in a model that only kept age_65p).
- Race is one categorical group, base "Other race", comparisons White / Black / Asian.
- "Employment status" (Worker vs Non-worker, `non_wrkr`) is a row; it is in 14 of the 35 models.
- Land-use Diversity is "Not high" vs "High".
