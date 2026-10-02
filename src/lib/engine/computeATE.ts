/**
 * Average Treatment Effect (ATE) Computation Engine
 *
 * Calculates ATEs for ordered categorical outcomes using ordered probit models.
 * Coefficients come from Jinghai's per-event models (see
 * data/jinghai_2026-09-28/model_coefficients_all_events.csv - his corrected
 * refit, delivered after fixing a missing `non_wrkr` column; supersedes the
 * original data/jinghai_2026-09-10/ delivery - converted to
 * public/models/model_coeffs_by_event.json). Each event (heat, cold, earthquake,
 * flooding, powerout) has its own coefficients per activity, and its own
 * 4-dummy severity encoding: {event}_imp_2 / _imp_3 / _imp_4 / _imp_5, with
 * "not severe at all" (imp_1) as the reference level (all four dummies 0).
 *
 * METHODOLOGY (matches Jinghai's ATE_Calculation.ipynb exactly - ate_severity()):
 * this is an "average of individual outcomes", NOT an "outcome of the average
 * person". For each person in the estimation sample, their own real row values
 * are used for every non-severity variable to compute THEIR linear predictor
 * and THEIR category probabilities; only then are those per-person
 * probabilities averaged across the sample to get P_base / P_comp. Holding
 * everyone at sample means first (the old approach) and computing probabilities
 * once is a materially different, less correct method - ordered probit's CDF
 * is nonlinear, so mean(f(x)) != f(mean(x)).
 *
 * DATA SOURCE: reads directly from Jinghai's per-event files
 * (public/models/event_data/{event}_data.csv, via
 * DataService.getEventScenarioData() in useScenarioATE.ts) - NOT df_output.csv.
 * Per Jinghai, these are the ground-truth estimation-sample files for these
 * models; they already carry the severity dummies under the same names the
 * coefficients use ({event}_imp_2.._imp_5 - no renaming needed, unlike
 * df_output.csv's {abbrev}_impaN spelling from the Gen-1 era), and per his
 * notebook's get_model(), the complete-case sample requires every coefficient
 * variable AND the activity's own dependent-variable column to be non-missing
 * (see getDvColumn/isWorkerOnlyActivity below) - the DV-completeness
 * requirement was missing from prior passes of this engine.
 */

import {
  averageOrderedProbabilities,
  extractThresholds,
  OrderedModelConfig
} from './orderedCategorical';

export interface ATEResult {
  activity: string;
  controlProbabilities: number[];
  treatmentProbabilities: number[];
  ate: number[];
  levelLabels: string[];
  conservationCheck: number; // Sum of ATE values (should be ~0)
  isValid: boolean;
  sampleSize: number; // Complete-case row count (0 for an invalid/empty result)
}

/** Model configs for every activity available for a single event. */
export interface EventModelData {
  [activity: string]: OrderedModelConfig;
}

/** Model configs grouped by event (heat, cold, earthquake, flooding, powerout). */
export interface ModelDataByEvent {
  [event: string]: EventModelData;
}

/**
 * The four severity dummy variables for an event (model_coefficients_all_events.csv
 * naming: {event}_imp_2.._imp_5). Level 1 ("not severe at all") is the
 * reference category and has no corresponding dummy - it's represented by all
 * four being 0.
 */
export function getSeverityDummyVariables(event: string): string[] {
  return [2, 3, 4, 5].map(level => `${event}_imp_${level}`);
}

/**
 * Dependent-variable column suffix per activity (Jinghai's ACT_DV mapping).
 * "use_transit" is handled separately (getDvColumn) since heat names its
 * transit column differently from every other event.
 */
const ACTIVITY_DV_SUFFIX: Record<string, string> = {
  'go_business_as_usual': 'lkly_normal_business',
  'stay_home': 'stay_home',
  'use_car': 'car_travel',
  'work_from_home': 'wfh',
  'work_from_office': 'commute',
  'dine_in': 'indoor_restaurant',
  'pick_up': 'takeout_pickup',
  'delivery': 'food_delivery'
};

/**
 * heat's transit column is named ext_heat_public_transit; every other event
 * uses ext_{event}_transit_use. Confirmed by Jinghai as a real naming quirk
 * in the source data, not an inconsistency to paper over.
 */
const TRANSIT_DV_SUFFIX_BY_EVENT: Record<string, string> = {
  heat: 'public_transit',
  cold: 'transit_use',
  earthquake: 'transit_use',
  flooding: 'transit_use',
  powerout: 'transit_use'
};

/** The actual ext_{event}_... dependent-variable column name for an activity. */
export function getDvColumn(event: string, activity: string): string {
  const suffix = activity === 'use_transit'
    ? (TRANSIT_DV_SUFFIX_BY_EVENT[event] ?? 'transit_use')
    : ACTIVITY_DV_SUFFIX[activity];
  return `ext_${event}_${suffix}`;
}

/** work_from_home / work_from_office restrict to workers only (empsta < 3). */
export function isWorkerOnlyActivity(activity: string): boolean {
  return activity === 'work_from_home' || activity === 'work_from_office';
}

/**
 * Verified fitting-sample mismatches (event/activity pairs where the "n"
 * recorded alongside Jinghai's coefficients cannot be reproduced by running
 * his own get_model() (ATE_Calculation.ipynb) against his own delivered
 * event_data file for that activity).
 *
 * RESOLVED 2026-09-28 (Slack, Zaid <> Jinghai): root cause was a missing
 * `non_wrkr` column in the datafile Jinghai was fitting on. He added it,
 * re-ran his full backward-elimination pipeline on the corrected data for
 * ALL 35 event/activity models (not just these three), and sent updated
 * model_coefficients_all_events.csv + event_data/*.csv - both rebuilt into
 * public/models/ on 2026-09-28. The 3 outlier gaps below are gone: n now
 * matches what buildEstimationSample already computed (powerout/GBU 2,381,
 * cold/GBU 2,434, earthquake/stay_home 611) confirming buildEstimationSample
 * was correct the whole time - the bug was entirely on Jinghai's original
 * fitting side. Every other model's n also shifted up slightly (the ~2.5-4%
 * gap this comment used to call "immaterial") for the same reason, and many
 * models' selected variables changed too (backward elimination re-ran on
 * more complete data) - this was a full refit, not a 3-model patch.
 * Kept as an empty set (rather than deleted) so a future real mismatch has
 * somewhere to go without re-deriving this flagging mechanism from scratch.
 */
const VERIFIED_SAMPLE_MISMATCHES = new Set<string>([]);

export function hasVerifiedSampleMismatch(event: string, activity: string): boolean {
  return VERIFIED_SAMPLE_MISMATCHES.has(`${event}::${activity}`);
}

export interface SeverityATEOptions {
  event: string;
  baseSeverityLevel: number;
  treatmentSeverityLevel: number;
}

const RESPONSE_LABELS = ['Do less', 'About the same', 'Do more'];

function emptyResult(activity: string): ATEResult {
  return {
    activity, controlProbabilities: [], treatmentProbabilities: [],
    ate: [], levelLabels: [], conservationCheck: 0, isValid: false, sampleSize: 0
  };
}

/**
 * Shared core, step 1 - the activity's estimation sample (Jinghai's
 * get_model(): worker filter for WFH/WFO, then sub[x_vars + [dv]].dropna()).
 * Every coefficient variable (including the severity dummies) AND the
 * activity's own dependent-variable column must be non-missing.
 */
function buildEstimationSample(
  event: string,
  activity: string,
  modelConfig: OrderedModelConfig,
  rows: any[]
): any[] {
  let sample = rows;
  // Per Jinghai: "For working from home and office should use subset of
  // sample only for worker."
  if (isWorkerOnlyActivity(activity)) {
    sample = rows.filter(row => {
      const empsta = parseFloat(String(row['empsta'] ?? ''));
      return !isNaN(empsta) && empsta < 3;
    });
    if (sample.length === 0) {
      console.warn(`No workers found for activity ${activity}, skipping ATE calculation`);
      return [];
    }
  }

  const dvColumn = getDvColumn(event, activity);
  const complete = sample.filter(row => {
    const variablesOk = modelConfig.variables.every(variable => {
      if (!(variable in row)) return false;
      return !isNaN(parseFloat(String(row[variable] ?? '')));
    });
    if (!variablesOk) return false;
    if (!(dvColumn in row)) return false;
    return !isNaN(parseFloat(String(row[dvColumn] ?? '')));
  });

  if (complete.length === 0) {
    console.warn(`No complete cases found for activity ${activity} (variables + DV non-NA), skipping ATE calculation`);
  }
  return complete;
}

/**
 * Everything about one (event, activity) estimation sample that does NOT
 * depend on the scenario being asked about: the complete-case rows, each
 * coefficient variable's parsed per-person values, and each person's full
 * observed linear predictor. A page view asks for severity ATEs plus ~35
 * segment comparisons plus 3 continuous ATEs on the same sample; rebuilding
 * and re-parsing it for every one of those (the previous behaviour) was what
 * made the Scenario page lag. Built once and reused - the arithmetic that
 * consumes it is unchanged, so every result is identical.
 */
interface PreparedActivity {
  sample: any[];
  /** Parsed per-person value of every coefficient variable (NaN -> 0, as before). */
  values: Record<string, Float64Array>;
  /** sum(coef * value) over every coefficient, in coefficient order, per person. */
  observedZ: Float64Array;
  /** Same sum excluding the severity dummies (severity ATEs force severity themselves). */
  nonSeverityZ: Float64Array | null;
  /** Segment base-scenario probabilities, keyed by the base spec restricted to in-model variables. */
  baseProbabilities: Map<string, number[]>;
}

// rows array -> model config -> "event::activity" -> prepared sample. WeakMaps, so
// nothing outlives the loaded dataset / model objects it was derived from.
const preparedCache = new WeakMap<object, WeakMap<object, Map<string, PreparedActivity>>>();

function getPreparedActivity(
  event: string,
  activity: string,
  modelConfig: OrderedModelConfig,
  rows: any[]
): PreparedActivity {
  let byModel = preparedCache.get(rows);
  if (!byModel) {
    byModel = new WeakMap();
    preparedCache.set(rows, byModel);
  }
  let byActivity = byModel.get(modelConfig);
  if (!byActivity) {
    byActivity = new Map();
    byModel.set(modelConfig, byActivity);
  }
  const key = `${event}::${activity}`;
  const cached = byActivity.get(key);
  if (cached) return cached;

  const sample = buildEstimationSample(event, activity, modelConfig, rows);
  const n = sample.length;
  const values: Record<string, Float64Array> = {};
  const observedZ = new Float64Array(n);
  for (const [variable, coefficient] of Object.entries(modelConfig.coefficients)) {
    const column = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const value = parseFloat(String(sample[i][variable] ?? '')) || 0;
      column[i] = value;
      observedZ[i] += coefficient * value;
    }
    values[variable] = column;
  }

  const prepared: PreparedActivity = { sample, values, observedZ, nonSeverityZ: null, baseProbabilities: new Map() };
  byActivity.set(key, prepared);
  return prepared;
}

/**
 * Shared core, step 2 - per-person category probabilities from each person's
 * own linear predictor z_i, THEN averaged across people (average of
 * outcomes, not outcome of averages). Returns native-scale probabilities.
 */
function averageProbabilities(predictors: ArrayLike<number>, modelConfig: OrderedModelConfig): number[] {
  return averageOrderedProbabilities(
    predictors,
    extractThresholds(modelConfig.thresholds),
    modelConfig.metadata.levels,
    modelConfig.metadata.link
  );
}

/**
 * Shared core, step 3 - GBU 5-to-3 collapse (after averaging), ATE, and
 * validity checks. go_business_as_usual is natively a 5-point likelihood
 * scale; [Very unlikely, Somewhat unlikely] -> "Do less", [Neutral] ->
 * "About the same", [Somewhat likely, Very likely] -> "Do more". Every other
 * activity is natively 3-category (1=Less, 2=About the same, 3=More).
 */
function buildATEResult(
  activity: string,
  modelConfig: OrderedModelConfig,
  baseProbabilities: number[],
  comparisonProbabilities: number[],
  sampleSize: number
): ATEResult {
  let control = baseProbabilities;
  let treatment = comparisonProbabilities;
  if (modelConfig.metadata.levels === 5) {
    const collapse = (p: number[]): number[] => [p[0] + p[1], p[2], p[3] + p[4]];
    control = collapse(control);
    treatment = collapse(treatment);
  }

  const ate = treatment.map((p, i) => p - control[i]);
  const conservationCheck = ate.reduce((sum, delta) => sum + delta, 0);
  const isValid = Math.abs(conservationCheck) < 1e-6 &&
                  control.every(p => p >= 0 && p <= 1) &&
                  treatment.every(p => p >= 0 && p <= 1);

  return {
    activity,
    controlProbabilities: control,
    treatmentProbabilities: treatment,
    ate,
    levelLabels: RESPONSE_LABELS,
    conservationCheck,
    isValid,
    sampleSize
  };
}

/**
 * Compute ATEs for every activity available for one event, comparing the
 * base severity level against the treatment (comparison) severity level.
 * Both are real severity dummy assignments (level 1 = reference, all dummies
 * 0). Severity is forced to a single scalar for everyone; every other
 * variable stays at each person's observed value.
 */
export function computeSeverityATEs(
  eventModelData: EventModelData,
  filteredData: any[],
  options: SeverityATEOptions
): ATEResult[] {
  const results: ATEResult[] = [];
  const { event, baseSeverityLevel, treatmentSeverityLevel } = options;
  const severityVars = getSeverityDummyVariables(event);

  for (const [activity, modelConfig] of Object.entries(eventModelData)) {
    try {
      const prepared = getPreparedActivity(event, activity, modelConfig, filteredData);
      const sample = prepared.sample;
      if (sample.length === 0) {
        results.push(emptyResult(activity));
        continue;
      }

      if (!prepared.nonSeverityZ) {
        const nonSeverityEntries = Object.entries(modelConfig.coefficients)
          .filter(([variable]) => !severityVars.includes(variable));
        const z = new Float64Array(sample.length);
        for (const [variable, coefficient] of nonSeverityEntries) {
          const column = prepared.values[variable];
          for (let i = 0; i < z.length; i++) z[i] += coefficient * column[i];
        }
        prepared.nonSeverityZ = z;
      }
      const basePredictors = prepared.nonSeverityZ;

      const severityAddend = (level: number): number =>
        level === 1 ? 0 : (modelConfig.coefficients[`${event}_imp_${level}`] ?? 0);

      const shifted = (addend: number): Float64Array => {
        const out = new Float64Array(basePredictors.length);
        for (let i = 0; i < out.length; i++) out[i] = basePredictors[i] + addend;
        return out;
      };

      const base = averageProbabilities(shifted(severityAddend(baseSeverityLevel)), modelConfig);
      const comparison = averageProbabilities(shifted(severityAddend(treatmentSeverityLevel)), modelConfig);

      results.push(buildATEResult(activity, modelConfig, base, comparison, sample.length));
    } catch (error) {
      console.error(`Error calculating ATE for activity ${activity}:`, error);
      results.push(emptyResult(activity));
    }
  }

  return results;
}

export interface SegmentATEOptions {
  event: string;
  /** {variable: forced value} for the base level - must list EVERY dummy in the group (siblings set to 0). */
  baseSpec: Record<string, number>;
  /** Same shape, for the comparison level. */
  comparisonSpec: Record<string, number>;
}

export interface SegmentATEResult extends ATEResult {
  /** False when the comparison cannot move the prediction in this event/activity's
   *  fitted model: none of the variables that DIFFER between the base and the
   *  comparison survived backward elimination (e.g. "Age 31-50 vs 18-30" in a model
   *  that only kept age_65p). The ATE is then exactly 0 by construction. This is
   *  Jinghai's per-comparison "In model?" flag (ATE_segments_by_model.xlsx). */
  inModel: boolean;
}

/**
 * Population-segment ATEs (Jinghai's ate_segment()). Each person keeps their
 * OWN observed severity (and every other variable); only the segment
 * variable group is forced to the base / comparison spec. Each person's
 * linear predictor is their full observed x*beta plus a per-person shift
 * sum((forced - observed) * coef) over the group's variables that are in the
 * model. Because the spec lists every sibling dummy, siblings are zeroed out
 * correctly (e.g. Age 31-50 = {age_3150:1, age_5165:0, age_65p:0}), and a
 * respondent's own observed sibling value is replaced rather than added to.
 * A group variable not in this activity's model contributes nothing.
 */
export function computeSegmentATEs(
  eventModelData: EventModelData,
  filteredData: any[],
  options: SegmentATEOptions
): SegmentATEResult[] {
  const results: SegmentATEResult[] = [];
  const { event, baseSpec, comparisonSpec } = options;

  for (const [activity, modelConfig] of Object.entries(eventModelData)) {
    try {
      const prepared = getPreparedActivity(event, activity, modelConfig, filteredData);
      const sample = prepared.sample;
      if (sample.length === 0) {
        results.push({ ...emptyResult(activity), inModel: false });
        continue;
      }

      const coefficients = modelConfig.coefficients;
      const inModelVars = Object.keys(baseSpec).filter(v => v in coefficients);
      // Only variables whose forced value differs between base and comparison can
      // change anything; if none of those is in the model the comparison is a no-op.
      const changedInModelVars = inModelVars.filter(v => baseSpec[v] !== (comparisonSpec[v] ?? 0));

      if (changedInModelVars.length === 0) {
        results.push({
          activity, controlProbabilities: [], treatmentProbabilities: [],
          ate: [0, 0, 0], levelLabels: RESPONSE_LABELS, conservationCheck: 0,
          isValid: true, sampleSize: sample.length, inModel: false
        });
        continue;
      }

      // Per-person linear predictor with the group's variables forced to a spec:
      // observed x*beta plus sum((forced - observed) * coef) over in-model group variables.
      const forcedPredictors = (spec: Record<string, number>): Float64Array => {
        const out = new Float64Array(sample.length);
        for (let i = 0; i < out.length; i++) {
          let shift = 0;
          for (const variable of inModelVars) {
            shift += ((spec[variable] ?? 0) - prepared.values[variable][i]) * coefficients[variable];
          }
          out[i] = prepared.observedZ[i] + shift;
        }
        return out;
      };

      // The base scenario is shared by every comparison in the same group - compute once.
      const baseKey = inModelVars.map(v => `${v}=${baseSpec[v]}`).join('|');
      let base = prepared.baseProbabilities.get(baseKey);
      if (!base) {
        base = averageProbabilities(forcedPredictors(baseSpec), modelConfig);
        prepared.baseProbabilities.set(baseKey, base);
      }
      const comparison = averageProbabilities(forcedPredictors(comparisonSpec), modelConfig);

      results.push({ ...buildATEResult(activity, modelConfig, base, comparison, sample.length), inModel: true });
    } catch (error) {
      console.error(`Error calculating segment ATE for activity ${activity}:`, error);
      results.push({ ...emptyResult(activity), inModel: false });
    }
  }

  return results;
}

export interface ContinuousATEOptions {
  event: string;
  /** The continuous variable's coefficient name, e.g. 'PR', 'CR', 'SE'. */
  variable: string;
  /** Multiplier on the estimation sample's SD of `variable` (Jinghai: 0.01 = "+1% of SD"). */
  mult: number;
}

export interface ContinuousATEResult extends ATEResult {
  /** False when `variable` isn't a coefficient of that event/activity's fitted model. */
  inModel: boolean;
}

/**
 * Continuous-variable ATEs (Jinghai's ate_continuous()). Unlike severity or
 * the discrete segments, nothing is forced to a fixed value: the base
 * scenario is simply each person's own full observed prediction (every
 * coefficient, including their real severity dummies, at their real row
 * values) with NO shift at all. The comparison scenario adds one uniform
 * scalar shift - coefficient[variable] * mult * SD(variable) - to every
 * person's base predictor, where SD is the standard deviation of `variable`
 * computed over THIS activity's own estimation sample (same rows
 * buildEstimationSample returns for this event/activity, not pooled across
 * events or activities, and not a population SD - matches pandas' default
 * sample SD, ddof=1, which is what `sample[var].std()` computes in the
 * notebook).
 */
export function computeContinuousATE(
  eventModelData: EventModelData,
  filteredData: any[],
  options: ContinuousATEOptions
): ContinuousATEResult[] {
  const results: ContinuousATEResult[] = [];
  const { event, variable, mult } = options;

  for (const [activity, modelConfig] of Object.entries(eventModelData)) {
    try {
      const prepared = getPreparedActivity(event, activity, modelConfig, filteredData);
      const sample = prepared.sample;
      if (sample.length === 0) {
        results.push({ ...emptyResult(activity), inModel: false });
        continue;
      }

      const coefficients = modelConfig.coefficients;
      if (!(variable in coefficients)) {
        results.push({
          activity, controlProbabilities: [], treatmentProbabilities: [],
          ate: [0, 0, 0], levelLabels: RESPONSE_LABELS, conservationCheck: 0,
          isValid: true, sampleSize: sample.length, inModel: false
        });
        continue;
      }

      const observedPredictors = prepared.observedZ;
      const values = prepared.values[variable];

      // Sample standard deviation (ddof=1), matching pandas' default .std().
      const n = values.length;
      let total = 0;
      for (let i = 0; i < n; i++) total += values[i];
      const mean = total / n;
      let squares = 0;
      for (let i = 0; i < n; i++) squares += (values[i] - mean) ** 2;
      const sd = Math.sqrt(squares / (n - 1));
      const shift = coefficients[variable] * mult * sd;

      const shiftedPredictors = new Float64Array(n);
      for (let i = 0; i < n; i++) shiftedPredictors[i] = observedPredictors[i] + shift;

      const base = averageProbabilities(observedPredictors, modelConfig);
      const comparison = averageProbabilities(shiftedPredictors, modelConfig);

      results.push({ ...buildATEResult(activity, modelConfig, base, comparison, sample.length), inModel: true });
    } catch (error) {
      console.error(`Error calculating continuous ATE for activity ${activity}:`, error);
      results.push({ ...emptyResult(activity), inModel: false });
    }
  }

  return results;
}

/**
 * Validate model data structure for a single event's activities.
 */
export function validateModelData(eventModelData: EventModelData): boolean {
  for (const [activity, config] of Object.entries(eventModelData)) {
    if (!config.metadata || !config.coefficients || !config.thresholds || !config.variables) {
      console.error(`Invalid model config for activity ${activity}: missing required fields`);
      return false;
    }

    const coefficientKeys = Object.keys(config.coefficients);
    const thresholdKeys = Object.keys(config.thresholds);

    if (config.variables.length !== coefficientKeys.length) {
      console.error(`Variable count mismatch for activity ${activity}: expected ${config.variables.length}, got ${coefficientKeys.length}`);
      return false;
    }

    const expectedThresholds = config.metadata.levels - 1;
    if (thresholdKeys.length !== expectedThresholds) {
      console.error(`Threshold count mismatch for activity ${activity}: expected ${expectedThresholds}, got ${thresholdKeys.length}`);
      return false;
    }

    for (const variable of config.variables) {
      if (!(variable in config.coefficients)) {
        console.error(`Missing coefficient for variable ${variable} in activity ${activity}`);
        return false;
      }
    }
  }

  return true;
}

/**
 * Get activity display names for UI.
 */
export function getActivityDisplayNames(): Record<string, string> {
  return {
    'use_transit': 'Use Transit',
    'use_car': 'Use Car',
    'stay_home': 'Stay at Home',
    'dine_in': 'Eat Indoors at a Restaurant',
    'pick_up': 'Pick Up Takeout',
    'delivery': 'Have Food Delivered',
    'work_from_home': 'Work from Home',
    'work_from_office': 'Work from Office',
    'go_business_as_usual': 'Go Business as Usual'
  };
}

/**
 * Format ATE results for display.
 */
export function formatATEResults(results: ATEResult[]): ATEResult[] {
  const displayNames = getActivityDisplayNames();

  return results.map(result => ({
    ...result,
    activity: displayNames[result.activity] || result.activity
  }));
}
