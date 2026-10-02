import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aqua: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          900: "#164e63"
        },
        navy: "#0f172a",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.07)",
      },
    },
  },
  plugins: [],
} satisfies Config;
