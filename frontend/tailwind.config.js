/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: { 500: '#0294cb', 600: '#0280b3', 700: '#016d99', 50: '#edf8fc', 100: '#d5effa' },
        gold: { 500: '#f3aa1f', 600: '#d99a1a', 50: '#fef8ec', 100: '#fdf0d3' },
      },
      fontFamily: {
        main: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};
