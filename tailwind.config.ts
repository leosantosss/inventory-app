import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1B4332",
          700: "#1B4332",
          600: "#2D6A4F",
          500: "#40916C",
          100: "#D8F3DC",
          50:  "#F0FBF4",
        },
        crimson: {
          DEFAULT: "#B91C1C",
          700: "#991B1B",
          100: "#FEE2E2",
          50:  "#FFF5F5",
        },
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
