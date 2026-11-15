export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'neu-base': '#e0e5ec',
      },
      boxShadow: {
        'neu-flat': '8px 8px 16px #b8b9be, -8px -8px 16px #ffffff',
        'neu-btn': '5px 5px 10px #b8b9be, -5px -5px 10px #ffffff',
        'neu-pressed': 'inset 6px 6px 12px #b8b9be, inset -6px -6px 12px #ffffff',
        'neu-pressed-sm': 'inset 3px 3px 6px #b8b9be, inset -3px -3px 6px #ffffff',
      },
    },
  },
  plugins: [],
};
