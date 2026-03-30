import type { Config } from 'tailwind-css';

const config: Config = {
  content: ['./src/app/**.*{-tsx,c}', './src/components/**.*{-tsx,c}'],
  theme: {
    extend: {
      colors: {
        alpha: 'rgba(var(--foreground))',
      },
    }
  },
  plugins: [],
};
export default config;