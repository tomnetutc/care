/**
 * Average Treatment Effect (ATE) Computation Engine
 *
 * Calculates ATEs for ordered categorical outcomes using ordered probit models.
 * Coefficients come from Jinghai's per-event models (see
 * data/jinghai_2026-09-10/model_coefficients_all_events.csv, converted to
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
  calculateOrderedProbabilities,
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

export interface SeverityATEOptions {
  event: string;
  baseSeverityLevel: number;
  treatmentSeverityLevel: number;
}

/**
 * Compute ATEs for every activity available for one event, comparing the
 * base severity level against the treatment (comparison) severity level.
 * Both are real severity dummy assignments (level 1 = reference, all dummies
 * 0) - not collapsed to a binary "low vs high" split.
 *
 * Every activity's result uses the same 3-category response scale
 * ["Do less", "About the same", "Do more"]. The 8 non-GBU activities are
 * natively coded that way (1=Less, 2=About the same, 3=More - confirmed by
 * Jinghai after the source codebook's stale labels were found to not match
 * the actual coding). "go_business_as_usual" (Usual) is natively a 5-point
 * likelihood scale; per Jinghai's ate_severity(), it's collapsed to the same
 * 3-category scale AFTER averaging the 5-level probabilities across people:
 * [Very unlikely, Somewhat unlikely] -> "Do less", [Neutral] -> "About the
 * same", [Somewhat likely, Very likely] -> "Do more".
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
      // Worker-only filter: for work_from_home / work_from_office, only workers
      // (empsta < 3) are in scope. Per Jinghai: "For working from home and
      // office should use subset of sample only for worker."
      let activityFilteredData = filteredData;
      if (isWorkerOnlyActivity(activity)) {
        activityFilteredData = filteredData.filter(row => {
          const empsta = parseFloat(String(row['empsta'] ?? ''));
          return !isNaN(empsta) && empsta < 3;
        });

        if (activityFilteredData.length === 0) {
          console.warn(`No workers found for activity ${activity}, skipping ATE calculation`);
          results.push({
            activity, controlProbabilities: [], treatmentProbabilities: [],
            ate: [], levelLabels: [], conservationCheck: 0, isValid: false, sampleSize: 0
          });
          continue;
        }
      }

      // Complete-case / estimation-sample filtering, matching get_model()'s
      // sub[x_vars + [dv]].dropna(): every coefficient variable (including
      // the severity dummies themselves - a person must have answered the
      // severity question) AND the activity's own dependent-variable column
      // must be non-missing.
      const dvColumn = getDvColumn(event, activity);
      const completeCaseData = activityFilteredData.filter(row => {
        const variablesOk = modelConfig.variables.every(variable => {
          if (!(variable in row)) return false;
          const value = parseFloat(String(row[variable] ?? ''));
          return !isNaN(value);
        });
        if (!variablesOk) return false;
        if (!(dvColumn in row)) return false;
        const dvValue = parseFloat(String(row[dvColumn] ?? ''));
        return !isNaN(dvValue);
      });

      if (completeCaseData.length === 0) {
        console.warn(`No complete cases found for activity ${activity} (variables + DV non-NA), skipping ATE calculation`);
        results.push({
          activity, controlProbabilities: [], treatmentProbabilities: [],
          ate: [], levelLabels: [], conservationCheck: 0, isValid: false, sampleSize: 0
        });
        continue;
      }

      // Per-person linear predictor over every NON-severity variable, using
      // each person's own real row values (xb = sum(sample[v] * coefs[v])).
      const nonSeverityEntries = Object.entries(modelConfig.coefficients)
        .filter(([variable]) => !severityVars.includes(variable));

      const basePredictors: number[] = completeCaseData.map(row => {
        let z = 0;
        for (const [variable, coefficient] of nonSeverityEntries) {
          z += coefficient * (parseFloat(String(row[variable] ?? '')) || 0);
        }
        return z;
      });

      // The severity contribution is a single scalar shared by everyone in a
      // given scenario (the forced group-level manipulation) - level 1 adds
      // nothing (reference category), any other level adds its dummy's coefficient.
      const severityAddend = (level: number): number =>
        level === 1 ? 0 : (modelConfig.coefficients[`${event}_imp_${level}`] ?? 0);

      const thresholds = extractThresholds(modelConfig.thresholds);
      const levels = modelConfig.metadata.levels;
      const link = modelConfig.metadata.link;

      // Per-person probabilities, THEN averaged across people (average of
      // outcomes, not outcome of averages - the core methodology fix).
      const averageProbabilities = (addend: number): number[] => {
        const sums = new Array(levels).fill(0);
        for (const z of basePredictors) {
          const { probabilities } = calculateOrderedProbabilities(z + addend, thresholds, levels, link);
          probabilities.forEach((p, i) => { sums[i] += p; });
        }
        return sums.map(s => s / basePredictors.length);
      };

      let controlProbabilities = averageProbabilities(severityAddend(baseSeverityLevel));
      let treatmentProbabilities = averageProbabilities(severityAddend(treatmentSeverityLevel));

      if (levels === 5) {
        // go_business_as_usual: collapse 5-level (Very unlikely..Very likely)
        // to the same 3-category scale as every other activity, post-averaging.
        const collapse = (p: number[]): number[] => [p[0] + p[1], p[2], p[3] + p[4]];
        controlProbabilities = collapse(controlProbabilities);
        treatmentProbabilities = collapse(treatmentProbabilities);
      }
      const levelLabels = ['Do less', 'About the same', 'Do more'];

      const ate = treatmentProbabilities.map((p, i) => p - controlProbabilities[i]);
      const conservationCheck = ate.reduce((sum, delta) => sum + delta, 0);
      const isValid = Math.abs(conservationCheck) < 1e-6 &&
                      controlProbabilities.every(p => p >= 0 && p <= 1) &&
                      treatmentProbabilities.every(p => p >= 0 && p <= 1);

      results.push({
        activity,
        controlProbabilities,
        treatmentProbabilities,
        ate,
        levelLabels,
        conservationCheck,
        isValid,
        sampleSize: completeCaseData.length
      });
    } catch (error) {
      console.error(`Error calculating ATE for activity ${activity}:`, error);
      results.push({
        activity, controlProbabilities: [], treatmentProbabilities: [],
        ate: [], levelLabels: [], conservationCheck: 0, isValid: false, sampleSize: 0
      });
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
