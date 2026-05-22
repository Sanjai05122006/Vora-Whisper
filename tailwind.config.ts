import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        "canvas-soft": "rgb(var(--canvas-soft) / <alpha-value>)",
        "canvas-soft-2": "rgb(var(--canvas-soft-2) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        body: "rgb(var(--body) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "on-primary": "rgb(var(--on-primary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)"
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "100px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 23, 23, 0.04), 0 8px 24px rgba(23, 23, 23, 0.04)"
      },
      fontSize: {
        "display-xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.05em", fontWeight: "600" }],
        "display-lg": ["2rem", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "600" }],
        "display-md": ["1.5rem", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "600" }],
        "display-sm": ["1.25rem", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
        code: ["0.8125rem", { lineHeight: "1.4", fontWeight: "400" }]
      },
      animation: {
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
        floatIn: "floatIn 420ms ease-out both"
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { transform: "scaleY(0.35)", opacity: "0.55" },
          "50%": { transform: "scaleY(1)", opacity: "1" }
        },
        floatIn: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
