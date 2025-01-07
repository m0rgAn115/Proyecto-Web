/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        keyframes: {
          'pulse-ring': {
            '0%': {
              transform: 'scale(0.8)',
              opacity: '0'
            },
            '50%': {
              opacity: '0.5'
            },
            '100%': {
              transform: 'scale(2)',
              opacity: '0'
            }
          }
        },
        animation: {
          'pulse-ring-1': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'pulse-ring-2': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'pulse-ring-3': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }
      },
    },
    plugins: [],
  };