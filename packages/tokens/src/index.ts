/**
 * Elymica Design Tokens - Sahara-Japandi Theme
 * @packageDocumentation
 */

export { colors } from './colors';
export type { ColorToken } from './colors';

export { typography } from './typography';
export type { TypographyToken } from './typography';

export { spacing } from './spacing';
export type { SpacingToken } from './spacing';

// Export combined tokens object
export const tokens = {
  colors,
  typography,
  spacing,
} as const;
