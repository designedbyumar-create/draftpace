/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['var(--font-space-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          navy: '#0F172A',
          indigo: '#3730A3',
          teal: '#0D9488',
          amber: '#D97706',
          cream: '#FAFAF7',
        },
      },
    },
  },
  plugins: [],
};

export default config;
