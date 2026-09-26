/**
 * Discrete population-segment groups for computeSegmentATEs, taken from
 * Jinghai's ATE_Calculation.ipynb SEGMENTS dict. Every spec lists EVERY
 * dummy in its group so sibling dummies are forced to 0 (never left at the
 * respondent's observed value). Dependency-free, like eventConfig.ts.
 *
 * Only groups with no open product question are defined here. Household
 * Income, Housing Type, Risk Aversion and Personal Resilience are pending.
 */
export interface SegmentGroup {
  label: string;
  baseLabel: string;
  baseSpec: Record<string, number>;
  comparisons: Array<{ label: string; spec: Record<string, number> }>;
}

export const SEGMENT_GROUPS: Record<string, SegmentGroup> = {
  gender: {
    label: 'Gender',
    baseLabel: 'Male',
    baseSpec: { female: 0 },
    comparisons: [{ label: 'Female', spec: { female: 1 } }]
  },
  age: {
    label: 'Age Group',
    baseLabel: '18-30',
    baseSpec: { age_3150: 0, age_5165: 0, age_65p: 0 },
    comparisons: [
      { label: '31-50', spec: { age_3150: 1, age_5165: 0, age_65p: 0 } },
      { label: '51-65', spec: { age_3150: 0, age_5165: 1, age_65p: 0 } },
      { label: '65+', spec: { age_3150: 0, age_5165: 0, age_65p: 1 } }
    ]
  },
  transitAccess: {
    label: 'Transit Access',
    baseLabel: 'Low',
    baseSpec: { TransitAccess_medium: 0, TransitAccess_high: 0 },
    comparisons: [
      { label: 'Medium', spec: { TransitAccess_medium: 1, TransitAccess_high: 0 } },
      { label: 'High', spec: { TransitAccess_medium: 0, TransitAccess_high: 1 } }
    ]
  }
};
