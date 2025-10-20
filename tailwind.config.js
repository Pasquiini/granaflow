/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0D9488', // verde petróleo
          positive: '#10B981',
          bg: '#F0FDF4',
          text: '#1E293B',
          muted: '#64748B',
        },
      },
      borderRadius: { xl2: '1rem' },
    },
  },
  plugins: [],
};
