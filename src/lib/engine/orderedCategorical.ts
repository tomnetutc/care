/**
 * Ordered Categorical Probability Calculator
 * 
 * Implements ordered logit/probit models for K-level categorical outcomes.
 * Supports both logistic CDF (logit) and normal CDF (probit) link functions.
 */

export interface OrderedModelConfig {
  metadata: {
    levels: number;
    link: 'logit' | 'probit';
  };
  coefficients: Record<string, number>;
  thresholds: Record<string, number>;
  variables: string[];
}

export interface ProbabilityResult {
  probabilities: number[];
  levels: string[];
  sum: number;
}

/**
 * Logistic CDF: Λ(z) = 1 / (1 + e^(-z))
 */
function logisticCDF(z: number): number {
  // Clamp z to prevent overflow
  const clampedZ = Math.max(-500, Math.min(500, z));
  return 1 / (1 + Math.exp(-clampedZ));
}

/**
 * Normal CDF approximation using the error function
 * This is a simplified approximation - for production use, consider a more precise implementation
 */
function normalCDF(z: number): number {
  // Clamp z to prevent overflow
  const clampedZ = Math.max(-6, Math.min(6, z));
  
  // Approximation using the error function
  // Φ(z) ≈ 0.5 * (1 + erf(z/√2))
  const erf = (x: number): number => {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  return 0.5 * (1 + erf(clampedZ / Math.sqrt(2)));
}

/**
 * Calculate ordered categorical probabilities for K levels
 * 
 * @param linearPredictor - The linear predictor μ = Xβ
 * @param thresholds - Threshold parameters τ₁, τ₂, ..., τ₍K-1₎
 * @param levels - Number of outcome levels
 * @param link - Link function ('logit' or 'probit')
 * @returns Probability distribution over K levels
 */
export function calculateOrderedProbabilities(
  linearPredictor: number,
  thresholds: number[],
  levels: number,
  link: 'logit' | 'probit'
): ProbabilityResult {
  if (levels < 2) {
    throw new Error('Number of levels must be at least 2');
  }

  if (thresholds.length !== levels - 1) {
    throw new Error(`Expected ${levels - 1} thresholds for ${levels} levels, got ${thresholds.length}`);
  }

  // Sort thresholds to ensure τ₁ < τ₂ < ... < τ₍K-1₎
  const sortedThresholds = [...thresholds].sort((a, b) => a - b);

  // Choose CDF function based on link
  const cdf = link === 'logit' ? logisticCDF : normalCDF;

  // Calculate probabilities for each level
  const probabilities: number[] = [];
  
  for (let k = 1; k <= levels; k++) {
    let prob: number;
    
    if (k === 1) {
      // P(Y = 1) = CDF(τ₁ - μ)
      prob = cdf(sortedThresholds[0] - linearPredictor);
    } else if (k === levels) {
      // P(Y = K) = 1 - CDF(τ₍K-1₎ - μ)
      prob = 1 - cdf(sortedThresholds[levels - 2] - linearPredictor);
    } else {
      // P(Y = k) = CDF(τₖ - μ) - CDF(τ₍k-1₎ - μ)
      prob = cdf(sortedThresholds[k - 1] - linearPredictor) - 
             cdf(sortedThresholds[k - 2] - linearPredictor);
    }
    
    // Ensure probability is in [0, 1]
    prob = Math.max(0, Math.min(1, prob));
    probabilities.push(prob);
  }

  // Calculate sum for validation
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0);

  // Generate level labels
  const levelLabels = Array.from({ length: levels }, (_, i) => {
    if (levels === 3) {
      return ['Do Less', 'About the Same', 'Do More'][i];
    } else if (levels === 5) {
      return ['Very Unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very Likely'][i];
    } else {
      return `Level ${i + 1}`;
    }
  });

  return {
    probabilities,
    levels: levelLabels,
    sum
  };
}

/**
 * Validate that probabilities sum to approximately 1
 */
export function validateProbabilitySum(probabilities: number[], tolerance: number = 1e-6): boolean {
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
  return Math.abs(sum - 1) < tolerance;
}

/**
 * Validate that all probabilities are in [0, 1]
 */
export function validateProbabilityRange(probabilities: number[]): boolean {
  return probabilities.every(prob => prob >= 0 && prob <= 1);
}

/**
 * Calculate the linear predictor μ = Xβ
 */
export function calculateLinearPredictor(
  featureVector: Record<string, number>,
  coefficients: Record<string, number>
): number {
  let linearPredictor = 0;
  
  for (const [variable, coefficient] of Object.entries(coefficients)) {
    const value = featureVector[variable] || 0;
    linearPredictor += coefficient * value;
  }
  
  return linearPredictor;
}

/**
 * Extract thresholds from the model configuration
 */
export function extractThresholds(thresholds: Record<string, number>): number[] {
  // Convert threshold keys like "1|2", "2|3" to sorted array
  const thresholdValues = Object.values(thresholds);
  return thresholdValues.sort((a, b) => a - b);
}

/**
 * Main function to calculate ordered categorical probabilities from model config
 */
export function calculateOrderedCategoricalProbabilities(
  featureVector: Record<string, number>,
  config: OrderedModelConfig
): ProbabilityResult {
  // Calculate linear predictor
  const linearPredictor = calculateLinearPredictor(featureVector, config.coefficients);
  
  // Extract and sort thresholds
  const thresholds = extractThresholds(config.thresholds);
  
  // Calculate probabilities
  const result = calculateOrderedProbabilities(
    linearPredictor,
    thresholds,
    config.metadata.levels,
    config.metadata.link
  );
  
  // Validate results
  if (!validateProbabilityRange(result.probabilities)) {
    console.warn('Some probabilities are outside [0, 1] range');
  }
  
  if (!validateProbabilitySum(result.probabilities)) {
    console.warn(`Probabilities sum to ${result.sum}, expected ~1`);
  }
  
  return result;
}
