import type { Config } from 'tailwindcss';
import orbitComponentsPreset from '@kiwicom/orbit-tailwind-preset';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@kiwicom/orbit-components/**/*.js', // adjust as necessary in monorepos
  ],
  theme: {
    extend: {
      fontFamily: {
        base: 'var(--font-base)',
      },
    },
  },
  plugins: [],
  presets: [orbitComponentsPreset()],
};
export default config;
