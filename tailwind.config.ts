import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: "#26C485", // Main green
        secondary: "#0A2239", // Dark blue
        accent: "#8D909B", // Gray
        // Status colors
        quiet: "#26C485", // Use brand green for quiet
        moderate: "#F59E0B", // amber
        busy: "#EF4444", // red
        // Brand text color
        brand: "#0A2239", // Dark blue for text
      },
    },
  },
  plugins: [],
};
export default config;