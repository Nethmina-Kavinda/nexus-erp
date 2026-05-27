// Shared math utilities for seeding scripts

// Box-Muller transform: generates standard normal random variable
function gaussianRandom() {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Gaussian random with specified mean and standard deviation
function gaussian(mean, stddev) {
  return mean + stddev * gaussianRandom();
}

// Clamp value to [min, max]
function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

// Cholesky decomposition of a symmetric positive-definite matrix
// Returns lower triangular matrix L such that A = L * L^T
function choleskyDecompose(matrix) {
  const n = matrix.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      if (i === j) {
        L[i][j] = Math.sqrt(matrix[i][i] - sum);
      } else {
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }
  return L;
}

// Sample from multivariate normal distribution
// means: array of means
// sigmas: array of standard deviations
// choleskyL: lower triangular Cholesky factor of correlation matrix
function sampleMVN(means, sigmas, choleskyL) {
  const n = means.length;
  const z = Array.from({ length: n }, () => gaussianRandom());

  // Multiply Cholesky L by z to get correlated standard normals
  const correlated = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      correlated[i] += choleskyL[i][j] * z[j];
    }
  }

  // Scale by sigma and shift by mean
  return means.map((mu, i) => clamp(mu + sigmas[i] * correlated[i]));
}

// Get the 6 seed months (October 2025 - March 2026)
function getSeedMonths() {
  return ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];
}

// Get working days for a given month (skip weekends)
function getWorkingDays(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(date);
    }
  }
  return days;
}

module.exports = {
  gaussianRandom,
  gaussian,
  clamp,
  choleskyDecompose,
  sampleMVN,
  getSeedMonths,
  getWorkingDays,
};
