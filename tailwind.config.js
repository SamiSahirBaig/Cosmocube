/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030508',
          900: '#05080D',
          850: '#070B12',
          800: '#0B111A',
          750: '#0F1722',
          700: '#141E2D',
          600: '#1E2C40',
        },
        cyan: {
          glow: '#00f3ff',
          dim: 'rgba(0, 243, 255, 0.15)',
        },
        alert: {
          red: '#ff3344',
          amber: '#ffaa00',
          green: '#00ff88',
          blue: '#0099ff',
          violet: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
