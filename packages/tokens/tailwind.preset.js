/**
 * Tailwind CSS preset for Elymica Sahara-Japandi theme
 * Import this in your tailwind.config.js:
 * presets: [require('@elymica/tokens/tailwind')]
 */

const { colors, typography, spacing } = require('./src');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        sand: colors.sandSoft,
        terracotta: colors.terracotta,
        olive: colors.oliveSage,
        sage: colors.deepSage,
        night: colors.nightSoil,
        gold: colors.accentGold,
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        gray: colors.gray,
      },
      fontFamily: {
        heading: typography.fonts.heading.split(','),
        body: typography.fonts.body.split(','),
        mono: typography.fonts.mono.split(','),
      },
      fontSize: typography.fontSizes,
      fontWeight: typography.fontWeights,
      lineHeight: typography.lineHeights,
      letterSpacing: typography.letterSpacing,
      spacing: spacing,
    },
  },
  plugins: [],
};
