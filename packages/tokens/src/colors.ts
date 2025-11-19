/**
 * Sahara-Japandi Color Palette
 * Inspired by African landscapes with Japanese minimalism
 */

export const colors = {
  // Primary palette
  sandSoft: '#F4EDE4',
  terracotta: '#D2967B',
  oliveSage: '#A5A58D',
  deepSage: '#6B705C',
  nightSoil: '#2F2D2A',
  accentGold: '#C2A878',

  // Semantic colors
  primary: '#6B705C',      // Deep Sage for primary actions
  secondary: '#D2967B',    // Terracotta for secondary actions
  accent: '#C2A878',       // Accent Gold for highlights
  background: '#F4EDE4',   // Sand Soft for main background
  surface: '#FFFFFF',      // White for cards/surfaces
  text: {
    primary: '#2F2D2A',    // Night Soil for main text
    secondary: '#6B705C',  // Deep Sage for secondary text
    muted: '#A5A58D',      // Olive Sage for disabled/muted
  },

  // Status colors
  success: '#6B8E23',      // Olive green
  warning: '#D2691E',      // Burnt orange
  error: '#B22222',        // Firebrick red
  info: '#4682B4',         // Steel blue

  // Neutral grays
  gray: {
    50: '#FAFAF9',
    100: '#F4EDE4',
    200: '#E7D9CC',
    300: '#C9BAA8',
    400: '#A5A58D',
    500: '#6B705C',
    600: '#4A4E3F',
    700: '#2F2D2A',
    800: '#1F1E1C',
    900: '#0F0E0D',
  },
} as const;

export type ColorToken = keyof typeof colors;
