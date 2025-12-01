/**
 * Average Treatment Effect (ATE) Computation Engine
 * 
 * Calculates ATEs for ordered categorical outcomes using ordered logit models.
 * Handles variable name inconsistencies and missing variables gracefully.
 */

import { 
  calculateOrderedCategoricalProbabilities, 
  OrderedModelConfig,
  calculateLinearPredictor,
  extractThresholds
} from './orderedCategorical';

export interface ATEResult {
  activity: string;
  controlProbabilities: number[];
  treatmentProbabilities: number[];
  ate: number[];
  levelLabels: string[];
  conservationCheck: number; // Sum of ATE values (should be ~0)
  isValid: boolean;
}

export interface ATEComputationOptions {
  treatmentVariable: string;
  controlValue: number;
  treatmentValue: number;
  variableNameMappings?: Record<string, string>; // Handle variable name inconsistencies
}

export interface ModelData {
  [activity: string]: OrderedModelConfig;
}

/**
 * Calculate mean values for variables from filtered data
 * Handles missing variables by computing interaction terms or defaulting to 0
 * 
 * Interaction variables are computed from base variables as per the notebook:
 * - a6170ve0 = hhveh0 * age_6170
 * - hrnt_i50 = home_rnt * in50
 * - PR_i250p = PR * in250p
 * - a40_ve2p = age_3140 * hhveh2p
 * - wr_mob = worker * mob_home
 * - s1_hcity = hhsize1 * hcity
 * - SE_i100p = SE * in100p
 * - urbanch = urban * (some variable - need to check)
 * - hcity_v0 = hcity * (some variable - need to check)
 * - CR_bs = CR * (some variable - need to check)
 */
export function calculateVariableMeans(
  filteredData: any[],
  variables: string[],
  variableNameMappings: Record<string, string> = {}
): Record<string, number> {
  const means: Record<string, number> = {};
  const missingVariables: string[] = [];
  const weightColumnCandidates = ['weights', 'weight', 'Weight', 'WEIGHT'];
  const getWeight = (row: any): number => {
    for (const key of weightColumnCandidates) {
      if (key in row) {
        const weightValue = parseFloat(String(row[key] ?? ''));
        if (!isNaN(weightValue) && weightValue > 0) {
          return weightValue;
        }
      }
    }
    return 1;
  };
  
  // Define interaction variable computations
  const interactionComputations: Record<string, (row: any) => number> = {
    'a6170ve0': (row: any) => {
      const hhveh0 = parseFloat(String(row['hhveh0'] || '0'));
      const age_6170 = parseFloat(String(row['age_6170'] || '0'));
      return (!isNaN(hhveh0) && !isNaN(age_6170)) ? hhveh0 * age_6170 : NaN;
    },
    'hrnt_i50': (row: any) => {
      const home_rnt = parseFloat(String(row['home_rnt'] || '0'));
      const in50 = parseFloat(String(row['in50'] || '0'));
      return (!isNaN(home_rnt) && !isNaN(in50)) ? home_rnt * in50 : NaN;
    },
    'PR_i250p': (row: any) => {
      const PR = parseFloat(String(row['PR'] || '0'));
      const in250p = parseFloat(String(row['in250p'] || '0'));
      return (!isNaN(PR) && !isNaN(in250p)) ? PR * in250p : NaN;
    },
    'a40_ve2p': (row: any) => {
      const age_3140 = parseFloat(String(row['age_3140'] || '0'));
      const hhveh2p = parseFloat(String(row['hhveh2p'] || '0'));
      return (!isNaN(age_3140) && !isNaN(hhveh2p)) ? age_3140 * hhveh2p : NaN;
    },
    'wr_mob': (row: any) => {
      const worker = parseFloat(String(row['worker'] || '0'));
      const mob_home = parseFloat(String(row['mob_home'] || '0'));
      return (!isNaN(worker) && !isNaN(mob_home)) ? worker * mob_home : NaN;
    },
    's1_hcity': (row: any) => {
      const hhsize1 = parseFloat(String(row['hhsize1'] || '0'));
      const hcity = parseFloat(String(row['hcity'] || '0'));
      return (!isNaN(hhsize1) && !isNaN(hcity)) ? hhsize1 * hcity : NaN;
    },
    'SE_i100p': (row: any) => {
      const SE = parseFloat(String(row['SE'] || '0'));
      const in100p = parseFloat(String(row['in100p'] || '0'));
      return (!isNaN(SE) && !isNaN(in100p)) ? SE * in100p : NaN;
    },
    'urbanch': (row: any) => {
      // urbanch = urban * child (from notebook Cell 12, 13)
      const urbanch = parseFloat(String(row['urbanch'] || '0'));
      if (!isNaN(urbanch)) return urbanch;
      const urban = parseFloat(String(row['urban'] || '0'));
      const child = parseFloat(String(row['child'] || '0'));
      return (!isNaN(urban) && !isNaN(child)) ? urban * child : NaN;
    },
    'hcity_v0': (row: any) => {
      // hcity_v0 = hhveh0 * hcity (from notebook Cell 12)
      const hcity_v0 = parseFloat(String(row['hcity_v0'] || '0'));
      if (!isNaN(hcity_v0)) return hcity_v0;
      const hhveh0 = parseFloat(String(row['hhveh0'] || '0'));
      const hcity = parseFloat(String(row['hcity'] || '0'));
      return (!isNaN(hhveh0) && !isNaN(hcity)) ? hhveh0 * hcity : NaN;
    },
    'CR_bs': (row: any) => {
      // CR_bs = CR * edu_bs (from notebook Cell 14)
      const CR_bs = parseFloat(String(row['CR_bs'] || '0'));
      if (!isNaN(CR_bs)) return CR_bs;
      const CR = parseFloat(String(row['CR'] || '0'));
      const edu_bs = parseFloat(String(row['edu_bs'] || '0'));
      return (!isNaN(CR) && !isNaN(edu_bs)) ? CR * edu_bs : NaN;
    }
  };
  
  for (const variable of variables) {
    // Skip impa345 - it's the treatment variable and will be set to 0/1 in feature vectors
    if (variable === 'impa345') {
      means[variable] = 0; // Will be overridden in feature vectors
      continue;
    }
    
    // Check for variable name mappings (e.g., less_hs vs hs_less)
    const actualVariableName = variableNameMappings[variable] || variable;
    
    // Try to find the variable in the data
    let found = false;
    let weightedSum = 0;
    let weightTotal = 0;
    
    for (const row of filteredData) {
      if (actualVariableName in row) {
        const value = parseFloat(String(row[actualVariableName] ?? ''));
        if (!isNaN(value)) {
          const weight = getWeight(row);
          weightedSum += value * weight;
          weightTotal += weight;
          found = true;
        }
      }
    }
    
    if (found && weightTotal > 0) {
      means[variable] = weightedSum / weightTotal;
    } else if (interactionComputations[variable]) {
      // Try to compute interaction variable
      let interactionWeightedSum = 0;
      let interactionWeightTotal = 0;
      
      for (const row of filteredData) {
        const computedValue = interactionComputations[variable](row);
        if (!isNaN(computedValue)) {
          const weight = getWeight(row);
          interactionWeightedSum += computedValue * weight;
          interactionWeightTotal += weight;
        }
      }
      
      if (interactionWeightTotal > 0) {
        means[variable] = interactionWeightedSum / interactionWeightTotal;
      } else {
        means[variable] = 0;
        missingVariables.push(variable);
      }
    } else {
      means[variable] = 0;
      missingVariables.push(variable);
    }
  }
  
  // Log warning for missing variables (only once per session)
  if (missingVariables.length > 0) {
    console.warn(`Missing variables in filtered data (defaulting to 0): ${missingVariables.join(', ')}`);
  }
  
  return means;
}

/**
 * Create feature vectors for control and treatment groups
 */
export function createFeatureVectors(
  variableMeans: Record<string, number>,
  treatmentVariable: string,
  controlValue: number,
  treatmentValue: number
): { control: Record<string, number>; treatment: Record<string, number> } {
  const controlVector = { ...variableMeans };
  const treatmentVector = { ...variableMeans };
  
  // Set treatment variable values
  controlVector[treatmentVariable] = controlValue;
  treatmentVector[treatmentVariable] = treatmentValue;
  
  return { control: controlVector, treatment: treatmentVector };
}

/**
 * Calculate ATE for a single activity
 */
export function calculateActivityATE(
  activity: string,
  modelConfig: OrderedModelConfig,
  controlVector: Record<string, number>,
  treatmentVector: Record<string, number>
): ATEResult {
  // Calculate linear predictors for debugging
  const controlLinearPredictor = calculateLinearPredictor(controlVector, modelConfig.coefficients);
  const treatmentLinearPredictor = calculateLinearPredictor(treatmentVector, modelConfig.coefficients);
  
  // Calculate probabilities for control group
  const controlResult = calculateOrderedCategoricalProbabilities(controlVector, modelConfig);
  
  // Calculate probabilities for treatment group
  const treatmentResult = calculateOrderedCategoricalProbabilities(treatmentVector, modelConfig);
  
  // Calculate ATE (difference in probabilities)
  const ate = treatmentResult.probabilities.map((treatProb, index) => 
    treatProb - controlResult.probabilities[index]
  );
  
  // Calculate conservation check (sum of ATE values should be ~0)
  const conservationCheck = ate.reduce((sum, delta) => sum + delta, 0);
  
  // Validate results
  const isValid = Math.abs(conservationCheck) < 1e-6 && 
                  controlResult.probabilities.every(p => p >= 0 && p <= 1) &&
                  treatmentResult.probabilities.every(p => p >= 0 && p <= 1);
  
  // Debug logging for key activities
  if (activity === 'use_transit' || activity === 'use_car' || activity === 'stay_home' || activity === 'go_business_as_usual') {
    const thresholds = extractThresholds(modelConfig.thresholds);
    console.log(`[${activity}] Detailed Calculation:`, {
      link: modelConfig.metadata.link,
      thresholds: thresholds.map((t: number) => t.toFixed(4)),
      controlLinearPredictor: controlLinearPredictor.toFixed(4),
      treatmentLinearPredictor: treatmentLinearPredictor.toFixed(4),
      controlProbs: controlResult.probabilities.map(p => p.toFixed(4)),
      treatmentProbs: treatmentResult.probabilities.map(p => p.toFixed(4)),
      ate: ate.map(a => a.toFixed(4)),
      controlVector: Object.entries(controlVector)
        .filter(([k]) => ['impa345', 'hcity', 'hhveh0', 'PR', 'CR', 'ac'].includes(k))
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v.toFixed(4) }), {})
    });
  }
  
  return {
    activity,
    controlProbabilities: controlResult.probabilities,
    treatmentProbabilities: treatmentResult.probabilities,
    ate,
    levelLabels: controlResult.levels,
    conservationCheck,
    isValid
  };
}

/**
 * Main function to compute ATEs for all activities
 */
export function computeATEs(
  modelData: ModelData,
  filteredData: any[],
  options: ATEComputationOptions
): ATEResult[] {
  const results: ATEResult[] = [];
  
  // Variable name mappings to handle inconsistencies
  const variableNameMappings = {
    'less_hs': 'hs_less',
    'hs_less': 'less_hs',
    ...options.variableNameMappings
  };
  
  for (const [activity, modelConfig] of Object.entries(modelData)) {
    try {
      // ISSUE 1: Filter to workers only (empsta < 3) for work_from_home and work_from_office
      // As per Jinghai: "For working from home and office should use subset of sample only for worker"
      let activityFilteredData = filteredData;
      if (activity === 'work_from_home' || activity === 'work_from_office') {
        activityFilteredData = filteredData.filter(row => {
          const empsta = parseFloat(String(row['empsta'] || row['employment_status'] || ''));
          return !isNaN(empsta) && empsta < 3; // empsta < 3 means worker
        });
        
        // If no workers found, skip this activity
        if (activityFilteredData.length === 0) {
          console.warn(`No workers found for activity ${activity}, skipping ATE calculation`);
          const errorResult: ATEResult = {
            activity,
            controlProbabilities: [],
            treatmentProbabilities: [],
            ate: [],
            levelLabels: [],
            conservationCheck: 0,
            isValid: false
          };
          results.push(errorResult);
          continue;
        }
      }
      
      // CRITICAL: Filter to rows where ALL model variables are non-NA (matching R code's dropna())
      // The R code calculates means from model_data after dropna(), which only includes rows
      // where all variables are non-NA. This is crucial for accurate mean calculation.
      const modelVariablesForFiltering = modelConfig.variables.filter(v => v !== 'impa345');
      // Helper function to check if a variable value is valid (exists and non-NA)
      const isValidVariableValue = (row: any, varName: string): boolean => {
        if (varName in row) {
          const value = parseFloat(String(row[varName] || ''));
          return !isNaN(value);
        }
        return false;
      };
      
      const completeCaseData = activityFilteredData.filter(row => {
        // Check if all model variables (except impa345) are present and non-NA
        for (const variable of modelVariablesForFiltering) {
          const actualVarName = (variableNameMappings[variable as keyof typeof variableNameMappings] || variable);
          
          // Check if variable exists in row and is non-NA
          if (isValidVariableValue(row, actualVarName)) {
            continue; // Variable is valid, check next
          }
          
          // For interaction variables, check if base variables exist and are non-NA
          if (variable === 'a6170ve0') {
            if (!isValidVariableValue(row, 'hhveh0') || !isValidVariableValue(row, 'age_6170')) return false;
          } else if (variable === 'hrnt_i50') {
            if (!isValidVariableValue(row, 'home_rnt') || !isValidVariableValue(row, 'in50')) return false;
          } else if (variable === 'PR_i250p') {
            if (!isValidVariableValue(row, 'PR') || !isValidVariableValue(row, 'in250p')) return false;
          } else if (variable === 'a40_ve2p') {
            if (!isValidVariableValue(row, 'age_3140') || !isValidVariableValue(row, 'hhveh2p')) return false;
          } else if (variable === 'wr_mob') {
            if (!isValidVariableValue(row, 'worker') || !isValidVariableValue(row, 'mob_home')) return false;
          } else if (variable === 's1_hcity') {
            if (!isValidVariableValue(row, 'hhsize1') || !isValidVariableValue(row, 'hcity')) return false;
          } else if (variable === 'SE_i100p') {
            if (!isValidVariableValue(row, 'SE') || !isValidVariableValue(row, 'in100p')) return false;
          } else if (variable === 'urbanch') {
            if (!isValidVariableValue(row, 'urban') || !isValidVariableValue(row, 'child')) return false;
          } else if (variable === 'hcity_v0') {
            if (!isValidVariableValue(row, 'hhveh0') || !isValidVariableValue(row, 'hcity')) return false;
          } else if (variable === 'CR_bs') {
            if (!isValidVariableValue(row, 'CR') || !isValidVariableValue(row, 'edu_bs')) return false;
          } else {
            // Variable doesn't exist and is not an interaction variable
            return false;
          }
        }
        return true;
      });
      
      if (completeCaseData.length === 0) {
        console.warn(`No complete cases found for activity ${activity} (all variables non-NA), skipping ATE calculation`);
        const errorResult: ATEResult = {
          activity,
          controlProbabilities: [],
          treatmentProbabilities: [],
          ate: [],
          levelLabels: [],
          conservationCheck: 0,
          isValid: false
        };
        results.push(errorResult);
        continue;
      }
      
      // Calculate variable means from complete case data only (matching R code's colMeans after dropna())
      // Note: The model expects "impa345" in the coefficients, but the actual data has event-specific
      // variables (heat_impa345, cold_impa345, etc.). The treatment variable "impa345" will not exist
      // in the data, so it will default to 0 in the means, and we'll override it with control/treatment
      // values in the feature vector. This is correct behavior.
      const variableMeans = calculateVariableMeans(
        completeCaseData,
        modelConfig.variables,
        variableNameMappings
      );
      
      // Debug: Log sample size and ALL variable means for troubleshooting
      if (activity === 'use_transit' || activity === 'work_from_office' || activity === 'go_business_as_usual') {
        console.log(`Variable means for ${activity} (complete cases: ${completeCaseData.length} out of ${activityFilteredData.length}):`, {
          completeCaseSize: completeCaseData.length,
          originalFilteredSize: activityFilteredData.length,
          allMeans: Object.entries(variableMeans)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value.toFixed(4) }), {}),
          keyMeans: Object.entries(variableMeans)
            .filter(([key]) => ['hcity', 'hhveh0', 'empsta', 'PR', 'CR', 'ac', 'impa345'].includes(key))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value.toFixed(4) }), {})
        });
      }
      
      // The model coefficients always use "impa345" as the treatment variable key.
      // We need to ensure the feature vector uses "impa345" as the key, regardless of which
      // event-specific variable (heat_impa345, cold_impa345, etc.) was used to identify the event.
      // The control/treatment values (0 or 1) are set directly, not derived from data means.
      const modelTreatmentVariable = 'impa345'; // Model always expects "impa345" as per JSON structure
      
      // Create feature vectors with treatment variable set to control/treatment values
      const { control, treatment } = createFeatureVectors(
        variableMeans,
        modelTreatmentVariable,
        options.controlValue,
        options.treatmentValue
      );
      
      // Calculate ATE for this activity
      let ateResult = calculateActivityATE(
        activity,
        modelConfig,
        control,
        treatment
      );
      
      // ISSUE 2: For "go_business_as_usual", aggregate 5-level ATE into "likely" vs "unlikely"
      // As per Jinghai: "responses were grouped into 'likely' ('very likely' and 'somewhat likely') 
      // and 'unlikely' ('very unlikely', 'somewhat unlikely', and 'neutral')"
      if (activity === 'go_business_as_usual' && ateResult.ate.length === 5) {
        // Aggregate: 
        // Unlikely = levels 0, 1, 2 (very unlikely, somewhat unlikely, neutral)
        // Likely = levels 3, 4 (somewhat likely, very likely)
        const unlikelyATE = ateResult.ate[0] + ateResult.ate[1] + ateResult.ate[2];
        const likelyATE = ateResult.ate[3] + ateResult.ate[4];
        
        // Replace 5-level ATE with 2-level aggregated ATE
        ateResult = {
          ...ateResult,
          ate: [unlikelyATE, likelyATE],
          controlProbabilities: [
            ateResult.controlProbabilities[0] + ateResult.controlProbabilities[1] + ateResult.controlProbabilities[2],
            ateResult.controlProbabilities[3] + ateResult.controlProbabilities[4]
          ],
          treatmentProbabilities: [
            ateResult.treatmentProbabilities[0] + ateResult.treatmentProbabilities[1] + ateResult.treatmentProbabilities[2],
            ateResult.treatmentProbabilities[3] + ateResult.treatmentProbabilities[4]
          ],
          levelLabels: ['Unlikely', 'Likely']
        };
      }
      
      results.push(ateResult);
      
    } catch (error) {
      console.error(`Error calculating ATE for activity ${activity}:`, error);
      
      // Create error result
      const errorResult: ATEResult = {
        activity,
        controlProbabilities: [],
        treatmentProbabilities: [],
        ate: [],
        levelLabels: [],
        conservationCheck: 0,
        isValid: false
      };
      
      results.push(errorResult);
    }
  }
  
  return results;
}

/**
 * Validate model data structure
 */
export function validateModelData(modelData: ModelData): boolean {
  for (const [activity, config] of Object.entries(modelData)) {
    // Check required fields
    if (!config.metadata || !config.coefficients || !config.thresholds || !config.variables) {
      console.error(`Invalid model config for activity ${activity}: missing required fields`);
      return false;
    }
    
    // Check that variables match coefficient keys
    const coefficientKeys = Object.keys(config.coefficients);
    const thresholdKeys = Object.keys(config.thresholds);
    
    if (config.variables.length !== coefficientKeys.length) {
      console.error(`Variable count mismatch for activity ${activity}: expected ${config.variables.length}, got ${coefficientKeys.length}`);
      return false;
    }
    
    // Check threshold count matches levels
    const expectedThresholds = config.metadata.levels - 1;
    if (thresholdKeys.length !== expectedThresholds) {
      console.error(`Threshold count mismatch for activity ${activity}: expected ${expectedThresholds}, got ${thresholdKeys.length}`);
      return false;
    }
    
    // Check that all variables have coefficients
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
 * Get activity display names for UI
 */
export function getActivityDisplayNames(): Record<string, string> {
  return {
    'use_transit': 'Use Transit',
    'use_car': 'Use Car',
    'stay_home': 'Stay at Home',
    'dine_in_pickup': 'Dine in / Pick up',
    'get_meal_delivered': 'Get Meal Delivered',
    'work_from_home': 'Work from Home',
    'work_from_office': 'Work from Office',
    'go_business_as_usual': 'Go Business as Usual'
  };
}

/**
 * Format ATE results for display
 */
export function formatATEResults(results: ATEResult[]): ATEResult[] {
  const displayNames = getActivityDisplayNames();
  
  return results.map(result => ({
    ...result,
    activity: displayNames[result.activity] || result.activity
  }));
}
