/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          DEFAULT: "#059669",
        },
        navy: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
          DEFAULT: "#0F172A",
        },
        forest: {
          900: "#0F172A", // Remap legacy references to Navy
        },
        sage: {
          600: "#059669", // Remap legacy references to Emerald
          400: "#10B981",
        },
        ivory: {
          DEFAULT: "#FFFFFF",
          dark: "#F8FAFC",
        },
        charcoal: {
          DEFAULT: "#0F172A",
          muted: "#475569",
        },
        lightneutral: "#E2E8F0",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        serif: ["Plus Jakarta Sans", "Inter", "sans-serif"], // Modern bold sans-serif for headings!
      },
      screens: {
        xxsm: "332px",
        xsm: "432px",
        xlplus: "1400px",
      },
    },
  },
  plugins: [],
};
