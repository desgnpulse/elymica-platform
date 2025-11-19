/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@elymica/tokens/tailwind')],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
