import baseConfig from "@travelese/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  presets: [baseConfig],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  plugins: [require("@todesktop/tailwind-variants")],
} satisfies Config;
