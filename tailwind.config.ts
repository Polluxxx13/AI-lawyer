import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#0A101D", 800: "#0F1726", 700: "#141D30", 600: "#1B2640" },
        gold: { DEFAULT: "#C9A24B", light: "#E3C77E", dark: "#9C7A30" },
        ivory: { DEFAULT: "#EDE8DC", muted: "#A9A59B" },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
