import orbitComponentsPreset from "@kiwicom/orbit-tailwind-preset";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../../node_modules/@kiwicom/orbit-components/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        base: "var(--font-base)",
      },
    },
  },
  plugins: [orbitComponentsPreset],
  prefix: "kw-",
} satisfies Config;
