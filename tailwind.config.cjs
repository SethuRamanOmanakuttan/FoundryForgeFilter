module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cartoonbrown: {
          DEFAULT: '#4B2E05',
          light: '#7C4F13',
          dark: '#2C1A02',
        },
        cartoonyellow: {
          DEFAULT: '#FFD966',
          light: '#FFECB3',
          dark: '#B89B2B',
        },
        cartoonblue: {
          DEFAULT: '#66A3FF',
          light: '#B3D1FF',
          dark: '#2B74B8',
        },
        cartoongreen: {
          DEFAULT: '#66FFB3',
          light: '#B3FFD9',
          dark: '#2BB874',
        },
        cartoonpink: {
          DEFAULT: '#FF66B3',
          light: '#FFB3D9',
          dark: '#B82B74',
        },
        cartoonborder: '#2C1A02',
      },
      fontFamily: {
        cartoon: ['Comic Sans MS', 'Comic Sans', 'cursive'],
      },
      borderRadius: {
        cartoon: '1.5rem',
        'cartoon-lg': '2rem',
        'cartoon-bubble': '2rem 2rem 2rem 0.5rem',
      },
      borderWidth: {
        cartoon: '6px',
        'cartoon-thick': '8px',
      },
      boxShadow: {
        'cartoon': '4px 4px 0px #2C1A02',
        'cartoon-lg': '8px 8px 0px #2C1A02',
        'cartoon-inner': 'inset 4px 4px 0px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulsate': 'pulsate 2s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulsate: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
} 