import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        "on-background": "var(--color-on-background)",

        surface: "var(--color-surface)",
        "surface-dim": "var(--color-surface-dim)",
        "surface-bright": "var(--color-surface-bright)",
        "surface-variant": "var(--color-surface-variant)",
        "surface-tint": "var(--color-surface-tint)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container": "var(--color-surface-container)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-container-highest": "var(--color-surface-container-highest)",

        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "inverse-surface": "var(--color-inverse-surface)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",

        outline: "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",

        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        "primary-container": "var(--color-primary-container)",
        "on-primary-container": "var(--color-on-primary-container)",
        "inverse-primary": "var(--color-inverse-primary)",
        "primary-fixed": "var(--color-primary-fixed)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",

        secondary: "var(--color-secondary)",
        "on-secondary": "var(--color-on-secondary)",
        "secondary-container": "var(--color-secondary-container)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",

        tertiary: "var(--color-tertiary)",
        "on-tertiary": "var(--color-on-tertiary)",
        "tertiary-container": "var(--color-tertiary-container)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",

        error: "var(--color-error)",
        "on-error": "var(--color-on-error)",
        "error-container": "var(--color-error-container)",
        "on-error-container": "var(--color-on-error-container)",

        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        lavender: {
          400: "#a78bfa",
          500: "#8b5cf6",
        },
        sage: {
          400: "#86efac",
          500: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
      },
      fontSize: {
        "headline-lg": [
          "40px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-md": [
          "32px",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-sm": [
          "24px",
          { lineHeight: "1.4", fontWeight: "600" },
        ],
        "body-lg": ["20px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-lg": [
          "16px",
          { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "600" },
        ],
        "label-md": [
          "14px",
          { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" },
        ],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      spacing: {
        base: "8px",
        xs: "4px",
        sm: "12px",
        md: "24px",
        lg: "48px",
        xl: "80px",
        gutter: "24px",
        margin: "32px",
      },
      boxShadow: {
        ambient:
          "0 4px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 8px -2px rgba(0, 0, 0, 0.08)",
        "ambient-hover":
          "0 12px 32px -8px rgba(0, 0, 0, 0.2), 0 4px 12px -4px rgba(0, 0, 0, 0.1)",
      },
      maxWidth: {
        content: "1024px",
      },
    },
  },
  plugins: [],
};

export default config;
