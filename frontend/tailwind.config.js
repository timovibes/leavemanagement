/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kfs: {
          green:  '#2d6a4f',
          light:  '#52b788',
          dark:   '#1b4332',
          accent: '#d8f3dc',
          muted:  '#f0f4f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}