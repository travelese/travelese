import orbitConfig from "@travelese/orbit/tailwind.config";
import baseConfig from "@travelese/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  presets: [orbitConfig, baseConfig],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/orbit/src/**/*.{ts,tsx}",
    "../../node_modules/@kiwicom/orbit-components/**/*.js",
  ],
  plugins: [require("@todesktop/tailwind-variants")],
} satisfies Config;
