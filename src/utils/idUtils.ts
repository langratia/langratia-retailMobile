/**
 * Generates a collision-resistant prefixed ID.
 *
 * Combines a millisecond timestamp (base-36) with a 7-character random suffix,
 * giving ~78 billion possible values per millisecond. This is safe for all
 * in-app use cases without requiring an external UUID library.
 */
export function generateId(prefix: 'prod' | 'tx'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}
