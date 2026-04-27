import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dce6fe',
          500: '#3b6bfa',
          600: '#2853e8',
          700: '#1e3fc4',
          900: '#0f1f5c'
        }
      }
    }
  },
  plugins: []
};

export default config;
