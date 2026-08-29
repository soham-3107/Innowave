/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        marine: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38aef9',
          500: '#0e94eb',
          600: '#0276c9',
          700: '#025ea2',
          800: '#075085',
          900: '#0c436e',
          950: '#051d3b',
          1000: '#030f26'
        },
        sand: {
          50: '#fefdf6',
          100: '#fdfbe7',
          200: '#faf3c1',
          300: '#f7e791',
          400: '#f2d45c',
          500: '#eab82c',
          600: '#ca941d',
          700: '#a36f18',
          850: '#efdbb2',
          900: '#68400f'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
