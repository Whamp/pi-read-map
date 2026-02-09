/**
 * Constants for thresholds.
 */
export const THRESHOLDS = {
  /** Maximum lines before truncation */
  MAX_LINES: 2000,
  /** Maximum bytes before truncation */
  MAX_BYTES: 50 * 1024,
  /** Maximum map size in bytes */
  MAX_MAP_BYTES: 20 * 1024,
  /** Target size for full detail */
  FULL_TARGET_BYTES: 10 * 1024,
  /** Target size for compact detail */
  COMPACT_TARGET_BYTES: 15 * 1024,
} as const;
