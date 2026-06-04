export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        system: { bg: '#05070f', panel: '#0a1326', glow: '#38bdf8', accent: '#60a5fa', danger: '#ef4444' },
      },
      boxShadow: { glow: '0 0 20px rgba(56,189,248,0.45), inset 0 0 12px rgba(56,189,248,0.25)' },
    },
  },
  plugins: [],
}

