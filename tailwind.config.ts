import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#120820',
          sidebar: '#1a0d2e',
          card: '#1e1035',
          border: '#2d1a4a',
          active: '#2a1a4e',
          teal: '#00c4a0',
          'teal-dark': '#009e84',
          text: '#e2d9f3',
          muted: '#9d8ec0',
        },
      },
    },
  },
  plugins: [],
}
export default config
