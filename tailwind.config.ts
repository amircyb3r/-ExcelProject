import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2f5bea",
          orange: "#ff8a00",
          light: "#f4f7ff"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
