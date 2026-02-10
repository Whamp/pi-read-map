/**
 * Constants for E2E tests.
 */

/** File map box delimiter used in formatted output. */
export const FILE_MAP_DELIMITER = "───────────────────────────────────────";

/**
 * Model assignments for E2E tests.
 *
 * Distributes tests across ZAI models to respect concurrency limits:
 * - glm-4.7: 3 concurrent (smartest, for complex large file tests)
 * - glm-4.6: 3 concurrent (medium, for large file tests)
 * - glm-4.5: 10 concurrent (fastest, for simple small file tests)
 */
export const MODELS = {
  /** Smartest model - for large Python/Go files with biggest context */
  SMART: "glm-4.7",

  /** Medium model - for large TypeScript/SQL files */
  MEDIUM: "glm-4.6",

  /** Fast model - for small files and simple tests */
  FAST: "glm-4.5",
} as const;

/** Provider for all E2E tests */
export const PROVIDER = "zai";
