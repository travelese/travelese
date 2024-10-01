import type { Config } from "tailwindcss";

const config: Config = {
  presets: [
    async () => {
      const orbitComponentsPreset = (
        await import("@kiwicom/orbit-tailwind-preset")
      ).default;
      return orbitComponentsPreset;
    },
  ],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@kiwicom/orbit-components/**/*.js", // adjust as necessary in monorepos
  ],
  theme: {
    extend: {
      fontFamily: {
        base: "var(--font-base)",
      },
    },
  },
  plugins: [],
};

export default config;
