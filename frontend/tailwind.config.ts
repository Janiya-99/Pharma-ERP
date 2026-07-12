import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import rtl from "tailwindcss-rtl";
import animate from "tailwindcss-animate";

const config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern:
        /^(bg|text|border|fill|stroke|ring)-(brand|blue|cyan|teal|indigo|sky|emerald|violet|slate|rose|amber)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ["hover", "ui-selected"],
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", ...fontFamily.sans],
      },
      colors: {
        /* ── Ocean-Blue ERP Palette ── */
        erp: {
          950: "#1e1b4b",
          900: "#312e81",
          800: "#3730a3",
          700: "#4338ca",
          600: "#4854CC",
          500: "#6366f1",
          400: "#818cf8",
          300: "#a5b4fc",
          200: "#c7d2fe",
          100: "#e0e7ff",
          50: "#eef2ff",
        },

        /* ── Shadcn CSS-variable tokens ── */
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },

        /* ── Semantic ERP Tokens ── */
        "erp-primary": "var(--erp-primary)",
        "erp-primary-hover": "var(--erp-primary-hover)",
        "erp-primary-dark": "var(--erp-primary-dark)",
        "erp-secondary": "var(--erp-secondary)",
        "erp-accent": "var(--erp-accent)",
        "erp-accent-soft": "var(--erp-accent-soft)",
        "erp-info": "var(--erp-info)",
        "erp-success": "var(--erp-success)",
        "erp-warning": "var(--erp-warning)",
        "erp-danger": "var(--erp-danger)",
        "erp-destructive": "var(--erp-destructive)",
        "erp-surface": "var(--erp-surface)",
        "erp-surface-blue": "var(--erp-surface-blue)",
        "erp-surface-muted": "var(--erp-surface-muted)",
        "erp-border-soft": "var(--erp-border-soft)",
        "erp-text-primary": "var(--erp-text-primary)",
        "erp-text-secondary": "var(--erp-text-secondary)",
        "erp-text-muted": "var(--erp-text-muted)",

        /* ── Legacy Colors (backward compat) ── */
        transparent: "transparent",
        current: "currentColor",
        white: "#ffffff",
        black: "#000000",
        lightPrimary: "#F4F7FE",
        blueSecondary: "#4318FF",
        brandLinear: "#868CFF",
        gray: {
          50: "#f8f9fa",
          100: "#edf2f7",
          200: "#e9ecef",
          300: "#cbd5e0",
          400: "#a0aec0",
          500: "#adb5bd",
          600: "#a3aed0",
          700: "#707eae",
          800: "#252f40",
          900: "#1b2559",
        },
        navy: {
          50: "#d0dcfb",
          100: "#aac0fe",
          200: "#a3b9f8",
          300: "#728fea",
          400: "#3652ba",
          500: "#1b3bbb",
          600: "#24388a",
          700: "#1B254B",
          800: "#111c44",
          900: "#0b1437",
        },
        red: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        orange: {
          50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74",
          400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c",
          800: "#9a3412", 900: "#7c2d12",
        },
        amber: {
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
          800: "#92400e", 900: "#78350f",
        },
        yellow: {
          50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047",
          400: "#fbcf33", 500: "#eab308", 600: "#ca8a04", 700: "#a16207",
          800: "#854d0e", 900: "#713f12",
        },
        green: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
          400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
          800: "#166534", 900: "#14532d",
        },
        teal: {
          50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4",
          400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e",
          800: "#115e59", 900: "#134e4a",
        },
        cyan: {
          50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9",
          400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490",
          800: "#155e75", 900: "#164e63",
        },
        blue: {
          50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd",
          400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8",
          800: "#1e40af", 900: "#1e3a8a",
        },
        indigo: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
          400: "#818cf8", 500: "#6366f1", 600: "#4854CC", 700: "#4338ca",
          800: "#3730a3", 900: "#312e81",
        },
        purple: {
          50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe",
          400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce",
          800: "#6b21a8", 900: "#581c87",
        },
        pink: {
          50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4",
          400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d",
          800: "#9d174d", 900: "#831843",
        },
        blueMono: {
          100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8",
          500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b",
          900: "#09090b",
        },
        brand: {
          50: "#E9E3FF", 100: "#C0B8FE", 200: "#A195FD", 300: "#8171FC",
          400: "#7551FF", 500: "#422AFB", 600: "#3311DB", 700: "#2111A5",
          800: "#190793", 900: "#11047A",
        },
        bb: {
          900: "#021024", 700: "#052659", 500: "#5483B3",
          300: "#7DA0CA", 100: "#C1E8FF",
        },
        shadow: { 500: "rgba(112, 144, 176, 0.08)" },
      },
      boxShadow: {
        "3xl": "14px 17px 40px 4px",
        inset: "inset 0px 18px 22px",
        darkinset: "0px 4px 4px inset",
        soft: "0 2px 15px -3px rgba(72, 84, 204, 0.06), 0 1px 4px -1px rgba(72, 84, 204, 0.04)",
        "erp-sm": "0 1px 3px rgba(30, 27, 75, 0.06), 0 1px 2px rgba(30, 27, 75, 0.04)",
        "erp-md": "0 4px 6px -1px rgba(30, 27, 75, 0.06), 0 2px 4px -2px rgba(30, 27, 75, 0.04)",
        "erp-lg": "0 10px 15px -3px rgba(30, 27, 75, 0.06), 0 4px 6px -4px rgba(30, 27, 75, 0.04)",
        "erp-glow": "0 0 20px rgba(72, 84, 204, 0.15)",
        "erp-glow-cyan": "0 0 20px rgba(72, 202, 228, 0.2)",
      },
      borderRadius: {
        primary: "20px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(72, 84, 204, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(72, 84, 204, 0.4)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "fade-up": "fade-up 0.3s ease-out",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [rtl, animate],
} satisfies Config;

export default config;
