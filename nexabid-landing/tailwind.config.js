/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        optimistic: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        'neutral-900': '#1c1e21',
        'nb-blue': '#0064e0',
        'nb-blue-dark': '#1877f2',
      },
      maxWidth: {
        'meta': '1504px',
      },
      letterSpacing: {
        'meta': '-0.01em',
        'meta-tight': '-0.014px',
      },
    },
  },
  plugins: [],
}
