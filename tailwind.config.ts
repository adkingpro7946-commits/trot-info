import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#db2777',
          600: '#be185d',
          700: '#9d174d',
        },
        ink: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
      maxWidth: {
        content: '46rem',
      },
    },
  },
  plugins: [],
};

export default config;
