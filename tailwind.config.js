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
      // One named scale, replacing the arbitrary text-[Npx] every component
      // used to invent for itself (see docs/DESIGN-SYSTEM.md, "Type scale").
      // Weight is deliberately not bundled here, same as Tailwind's own
      // scale: font-semibold etc. stay a separate utility per call site.
      fontSize: {
        eyebrow: ['11px', { lineHeight: '1.4', letterSpacing: '0.12em' }],
        caption: ['12px', { lineHeight: '1.4' }],
        'body-sm': ['13.5px', { lineHeight: '1.6' }],
        body: ['15px', { lineHeight: '1.7' }],
        'body-lg': ['16.5px', { lineHeight: '1.75' }],
        'heading-sm': ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        heading: ['clamp(1.75rem, 0.917rem + 3.33vw, 2.25rem)', { lineHeight: '1.1' }],
        'heading-lg': ['clamp(1.875rem, 0.625rem + 5vw, 2.625rem)', { lineHeight: '1.08' }],
        display: ['clamp(2.375rem, 0.083rem + 9.17vw, 3.75rem)', { lineHeight: '1.05' }],
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
