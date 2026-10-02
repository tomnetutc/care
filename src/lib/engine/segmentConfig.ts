/**
 * Discrete population-segment groups for computeSegmentATEs. Every spec
 * lists EVERY dummy in its group so sibling dummies are forced to 0 (never
 * left at the respondent's observed value). Dependency-free, like
 * eventConfig.ts.
 *
 * Discrete groups only. Continuous attitude scores (PR/CR/SE) are not
 * defined here - handled separately via computeContinuousATE (mult=0.01,
 * "+1% of SD", confirmed by Jinghai). "Risk Aversion" was dropped: no such
 * variable exists in the models.
 *
 * Labels, base/comparison wording, and grouping (`label` on each entry
 * below doubles as which of the 4 dashboard sections it belongs in) are
 * taken verbatim from Jinghai's own delivered, validated answer key -
 * data/jinghai_2026-09-10/ATE_Heat.xlsx, Segment_ATE sheet (27 rows: 3
 * continuous + 24 discrete here). Variable encodings (which column, 0/1
 * meaning, reference category) are taken from his Codebook.xlsx,
 * "Independent Variables" sheet - not guessed. Checked 2026-09-28: the
 * dashboard originally implemented only 5 of these 24 discrete groups
 * (gender, age, transitAccess, householdIncome, housingType); the other 19
 * were simply missing, not hardcoded wrong - added below using the same
 * pattern, same computeSegmentATEs engine, same inModel=false-if-eliminated
 * handling as the original 5.
 */
export interface SegmentGroup {
  label: string;
  baseLabel: string;
  baseSpec: Record<string, number>;
  comparisons: Array<{ label: string; spec: Record<string, number> }>;
}

export const SEGMENT_GROUPS: Record<string, SegmentGroup> = {
  // --- Socio-Demographics ---
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
  // edu_bs = "has a Bachelor's degree" (distinct from bs_grad below).
  educationBachelors: {
    label: "Education (Bachelor's)",
    baseLabel: 'No BS',
    baseSpec: { edu_bs: 0 },
    comparisons: [{ label: 'Has BS', spec: { edu_bs: 1 } }]
  },
  // bs_grad = "has at least a Bachelor's degree" - a separate coded variable
  // from edu_bs per Codebook.xlsx, not a duplicate.
  educationBsOrHigher: {
    label: 'Education (BS or higher)',
    baseLabel: 'Below BS',
    baseSpec: { bs_grad: 0 },
    comparisons: [{ label: 'BS or higher', spec: { bs_grad: 1 } }]
  },
  // Race is ONE categorical group with "Other race" as the reference level
  // (all three dummies 0), exactly as in Jinghai's ATE_segments_by_model.xlsx
  // (2026-10-01): each comparison forces its own dummy to 1 and the other two
  // to 0. This matters in the models that keep more than one of
  // white/black/asian (heat/use_car, cold/work_from_home|office,
  // earthquake/stay_home, powerout/pick_up), where toggling one dummy while
  // leaving the others at each person's observed value gives different numbers.
  race: {
    label: 'Race',
    baseLabel: 'Other race',
    baseSpec: { white: 0, black: 0, asian: 0 },
    comparisons: [
      { label: 'White', spec: { white: 1, black: 0, asian: 0 } },
      { label: 'Black', spec: { white: 0, black: 1, asian: 0 } },
      { label: 'Asian', spec: { white: 0, black: 0, asian: 1 } }
    ]
  },
  // hispanic_c is the CLEANED dummy (Codebook: use this, not raw hispanic,
  // whose 1=Yes/2=No coding reverses the sign if used directly).
  ethnicityHispanic: {
    label: 'Ethnicity: Hispanic',
    baseLabel: 'Not Hispanic',
    baseSpec: { hispanic_c: 0 },
    comparisons: [{ label: 'Hispanic', spec: { hispanic_c: 1 } }]
  },
  disability: {
    label: 'Disability',
    baseLabel: 'No disability',
    baseSpec: { dis_yes: 0 },
    comparisons: [{ label: 'Has disability', spec: { dis_yes: 1 } }]
  },
  // non_wrkr (non-worker) only exists in Jinghai's corrected 2026-09-28 data and is
  // kept in 14 of the 35 refit models; it is a row in ATE_segments_by_model.xlsx
  // (2026-10-01) and was not in the earlier 27-variable key.
  employmentStatus: {
    label: 'Employment status',
    baseLabel: 'Worker',
    baseSpec: { non_wrkr: 0 },
    comparisons: [{ label: 'Non-worker', spec: { non_wrkr: 1 } }]
  },
  worksOutdoors: {
    label: 'Works outdoors',
    baseLabel: 'No',
    baseSpec: { work_out: 0 },
    comparisons: [{ label: 'Yes', spec: { work_out: 1 } }]
  },
  doesNotTelecommute: {
    label: 'Does not telecommute',
    baseLabel: 'Telecommutes',
    baseSpec: { tcom_no: 0 },
    comparisons: [{ label: 'Does not telecommute', spec: { tcom_no: 1 } }]
  },

  // --- Household Attributes ---
  householdIncome: {
    label: 'Household Income',
    baseLabel: 'Less than $50k',
    baseSpec: { in50: 1, in50100: 0 },
    comparisons: [
      { label: '$50k-$100k', spec: { in50: 0, in50100: 1 } },
      { label: '$100k or higher', spec: { in50: 0, in50100: 0 } }
    ]
  },
  householdSize: {
    label: 'Household Size',
    baseLabel: '3+ persons',
    baseSpec: { hhsize1: 0, hhsize2: 0 },
    comparisons: [
      { label: '1 person', spec: { hhsize1: 1, hhsize2: 0 } },
      { label: '2 persons', spec: { hhsize1: 0, hhsize2: 1 } }
    ]
  },
  childInHousehold: {
    label: 'Child in household',
    baseLabel: 'No child',
    baseSpec: { child: 0 },
    comparisons: [{ label: 'Has child', spec: { child: 1 } }]
  },
  housingType: {
    label: 'Housing Type',
    baseLabel: 'Not stand-alone',
    baseSpec: { sa_home: 0 },
    comparisons: [{ label: 'Stand-alone house', spec: { sa_home: 1 } }]
  },
  zeroVehicleHousehold: {
    label: 'Zero-vehicle household',
    baseLabel: 'Has vehicle',
    baseSpec: { hhveh0: 0 },
    comparisons: [{ label: 'Zero vehicle', spec: { hhveh0: 1 } }]
  },
  // ac_c is the CLEANED dummy (Codebook: use this, not raw ac, whose -9
  // "not shown"/skip-logic sentinel is not a real 0). Any respondent
  // missing ac_c is already excluded upstream by buildEstimationSample
  // whenever ac_c is one of that activity's model coefficients (the same
  // dropna() completeness check Jinghai's own get_model() applies) - so no
  // separate missing-data handling is needed here.
  airConditioning: {
    label: 'Air conditioning',
    baseLabel: 'No A/C',
    baseSpec: { ac_c: 0 },
    comparisons: [{ label: 'Has A/C', spec: { ac_c: 1 } }]
  },

  // --- Community Resources ---
  rural: {
    label: 'Rural location',
    baseLabel: 'Not rural',
    baseSpec: { rural: 0 },
    comparisons: [{ label: 'Rural', spec: { rural: 1 } }]
  },
  populationDensity: {
    label: 'Population Density',
    baseLabel: 'Low',
    baseSpec: { PopDens_medium: 0, PopDens_high: 0 },
    comparisons: [
      { label: 'Medium', spec: { PopDens_medium: 1, PopDens_high: 0 } },
      { label: 'High', spec: { PopDens_medium: 0, PopDens_high: 1 } }
    ]
  },
  employmentDensity: {
    label: 'Employment Density',
    baseLabel: 'Low',
    baseSpec: { EmpDens_medium: 0, EmpDens_high: 0 },
    comparisons: [
      { label: 'Medium', spec: { EmpDens_medium: 1, EmpDens_high: 0 } },
      { label: 'High', spec: { EmpDens_medium: 0, EmpDens_high: 1 } }
    ]
  },
  networkDensity: {
    label: 'Network Density',
    baseLabel: 'Low',
    baseSpec: { NetworkDensity_medium: 0, NetworkDensity_high: 0 },
    comparisons: [
      { label: 'Medium', spec: { NetworkDensity_medium: 1, NetworkDensity_high: 0 } },
      { label: 'High', spec: { NetworkDensity_medium: 0, NetworkDensity_high: 1 } }
    ]
  },
  // Jinghai's ATE_segments_by_model.xlsx defines this as "Not high" vs "High"
  // (Diversity_medium is not a coefficient in any of the 35 models).
  landUseDiversity: {
    label: 'Land-use Diversity',
    baseLabel: 'Not high',
    baseSpec: { Diversity_high: 0 },
    comparisons: [{ label: 'High', spec: { Diversity_high: 1 } }]
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
  walkabilityIndex: {
    label: 'Walkability Index',
    baseLabel: 'Very low',
    baseSpec: { NatWalkInd_low: 0, NatWalkInd_high: 0, NatWalkInd_very_high: 0 },
    comparisons: [
      { label: 'Low', spec: { NatWalkInd_low: 1, NatWalkInd_high: 0, NatWalkInd_very_high: 0 } },
      { label: 'High', spec: { NatWalkInd_low: 0, NatWalkInd_high: 1, NatWalkInd_very_high: 0 } },
      { label: 'Very high', spec: { NatWalkInd_low: 0, NatWalkInd_high: 0, NatWalkInd_very_high: 1 } }
    ]
  }
};
