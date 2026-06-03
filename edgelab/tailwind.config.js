export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono:  ['"JetBrains Mono"', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        bg:           '#0a0c0f',
        surface:      '#111318',
        panel:        '#161a21',
        border:       '#1e2530',
        borderBright: '#2a3445',
        green:        '#00d17a',
        red:          '#ff3d5a',
        yellow:       '#f5c842',
        blue:         '#3d9bff',
        muted:        '#6b7a91',
        dim:          '#3d4a5c',
      }
    },
  },
  plugins: [],
}
