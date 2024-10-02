import orbitConfig from "@travelese/orbit/tailwind.config";
import baseConfig from "@travelese/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/orbit/src/**/*.{ts,tsx}",
  ],
  presets: [baseConfig],
  theme: {
    extend: {
      ...orbitConfig.theme.extend,
    },
  },
  plugins: [
    require("@todesktop/tailwind-variants"),
    ...baseConfig.plugins,
    ...orbitConfig.plugins,
  ],
} satisfies Config;
