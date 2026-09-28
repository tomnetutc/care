/**
 * Discrete population-segment groups for computeSegmentATEs, taken from
 * Jinghai's ATE_Calculation.ipynb SEGMENTS dict. Every spec lists EVERY
 * dummy in its group so sibling dummies are forced to 0 (never left at the
 * respondent's observed value). Dependency-free, like eventConfig.ts.
 *
 * Discrete groups only. Continuous attitude scores (PR/CR/SE) are not
 * defined here - their shift size is still pending Jinghai. "Risk
 * Aversion" was dropped: no such variable exists in the models.
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
  },
  householdIncome: {
    label: 'Household Income',
    baseLabel: 'Less than $50k',
    baseSpec: { in50: 1, in50100: 0 },
    comparisons: [
      { label: '$50k-$100k', spec: { in50: 0, in50100: 1 } },
      { label: '$100k or higher', spec: { in50: 0, in50100: 0 } }
    ]
  },
  housingType: {
    label: 'Housing Type',
    baseLabel: 'Not stand-alone',
    baseSpec: { sa_home: 0 },
    comparisons: [{ label: 'Stand-alone house', spec: { sa_home: 1 } }]
  }
};
