/**
 * AHP (Analytic Hierarchy Process) Calculator
 *
 * Implements the AHP methodology for multi-criteria decision making.
 * Uses pairwise comparisons to calculate optimal weights.
 *
 * Reference: Saaty, T.L. (1980). The Analytic Hierarchy Process.
 */

export interface PairwiseComparison {
  itemA: string
  itemB: string
  value: number // 1-9 scale (1=equal, 9=extreme preference for A)
}

export interface AHPResult {
  weights: Record<string, number> // Normalized weights (sum = 100%)
  consistencyRatio: number // Should be < 0.10 for acceptable consistency
  isConsistent: boolean
}

// Random Index (RI) values for consistency check
// Source: Saaty, T.L. (1980)
const RANDOM_INDEX: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
}

/**
 * Build a pairwise comparison matrix from comparisons
 */
function buildComparisonMatrix(
  items: string[],
  comparisons: PairwiseComparison[]
): number[][] {
  const n = items.length
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(1))

  // Diagonal is always 1 (item compared to itself)
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1
  }

  // Fill matrix from comparisons
  comparisons.forEach(comp => {
    const indexA = items.indexOf(comp.itemA)
    const indexB = items.indexOf(comp.itemB)

    if (indexA !== -1 && indexB !== -1) {
      matrix[indexA][indexB] = comp.value
      matrix[indexB][indexA] = 1 / comp.value // Reciprocal
    }
  })

  return matrix
}

/**
 * Calculate weights using the eigenvector method (geometric mean)
 * This is a simplified but robust approach for AHP
 */
function calculateWeights(matrix: number[][]): number[] {
  const n = matrix.length
  const weights: number[] = []

  // Calculate geometric mean for each row
  for (let i = 0; i < n; i++) {
    let product = 1
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j]
    }
    weights[i] = Math.pow(product, 1 / n)
  }

  // Normalize to sum = 1
  const sum = weights.reduce((acc, w) => acc + w, 0)
  return weights.map(w => w / sum)
}

/**
 * Calculate the principal eigenvalue (lambda max)
 * Used for consistency ratio calculation
 */
function calculateLambdaMax(matrix: number[][], weights: number[]): number {
  const n = matrix.length
  const weightedSum: number[] = Array(n).fill(0)

  // Matrix multiplication: matrix * weights
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      weightedSum[i] += matrix[i][j] * weights[j]
    }
  }

  // Calculate lambda max as average of (weightedSum[i] / weights[i])
  let lambdaMax = 0
  for (let i = 0; i < n; i++) {
    lambdaMax += weightedSum[i] / weights[i]
  }
  lambdaMax /= n

  return lambdaMax
}

/**
 * Calculate consistency ratio
 * CR = CI / RI
 * where CI = (lambda_max - n) / (n - 1)
 *
 * CR < 0.10 is considered acceptable
 */
function calculateConsistencyRatio(matrix: number[][], weights: number[]): number {
  const n = matrix.length

  // Special cases
  if (n <= 2) return 0 // Always consistent for 2 items or less

  const lambdaMax = calculateLambdaMax(matrix, weights)
  const CI = (lambdaMax - n) / (n - 1)
  const RI = RANDOM_INDEX[n] || 1.49 // Default to max RI if not found

  return CI / RI
}

/**
 * Main AHP calculation function
 *
 * @param items - Array of item names to compare
 * @param comparisons - Array of pairwise comparisons
 * @returns AHPResult with weights and consistency metrics
 */
export function calculateAHPWeights(
  items: string[],
  comparisons: PairwiseComparison[]
): AHPResult {
  if (items.length === 0) {
    throw new Error('Items array cannot be empty')
  }

  if (items.length === 1) {
    // Single item gets 100%
    return {
      weights: { [items[0]]: 100 },
      consistencyRatio: 0,
      isConsistent: true,
    }
  }

  // Build comparison matrix
  const matrix = buildComparisonMatrix(items, comparisons)

  // Calculate normalized weights (0-1 scale)
  const normalizedWeights = calculateWeights(matrix)

  // Calculate consistency ratio
  const consistencyRatio = calculateConsistencyRatio(matrix, normalizedWeights)

  // Convert to percentage (0-100 scale)
  const weights: Record<string, number> = {}
  items.forEach((item, i) => {
    weights[item] = Math.round(normalizedWeights[i] * 100)
  })

  // Ensure weights sum to exactly 100% (fix rounding errors)
  const sum = Object.values(weights).reduce((acc, w) => acc + w, 0)
  if (sum !== 100) {
    // Add difference to largest weight
    const maxItem = Object.keys(weights).reduce((a, b) =>
      weights[a] > weights[b] ? a : b
    )
    weights[maxItem] += (100 - sum)
  }

  return {
    weights,
    consistencyRatio,
    isConsistent: consistencyRatio < 0.10,
  }
}

/**
 * Generate all possible pairs from an array of items
 * For n items, returns n(n-1)/2 pairs
 */
export function generatePairs(items: string[]): Array<{ itemA: string; itemB: string }> {
  const pairs: Array<{ itemA: string; itemB: string }> = []

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push({
        itemA: items[i],
        itemB: items[j],
      })
    }
  }

  return pairs
}

/**
 * Get interpretation of consistency ratio
 */
export function getConsistencyInterpretation(cr: number): {
  level: 'excellent' | 'good' | 'acceptable' | 'poor'
  message: string
} {
  if (cr < 0.05) {
    return {
      level: 'excellent',
      message: 'Your comparisons are highly consistent!',
    }
  } else if (cr < 0.08) {
    return {
      level: 'good',
      message: 'Your comparisons are consistent.',
    }
  } else if (cr < 0.10) {
    return {
      level: 'acceptable',
      message: 'Your comparisons are acceptably consistent.',
    }
  } else {
    return {
      level: 'poor',
      message: 'Your comparisons may be inconsistent. Consider reviewing your answers.',
    }
  }
}
