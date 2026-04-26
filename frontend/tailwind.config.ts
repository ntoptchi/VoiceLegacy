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
        background: "#fbf7f2",
        "on-background": "#211d1a",

        surface: "#fbf7f2",
        "surface-dim": "#ded6cf",
        "surface-bright": "#fffaf5",
        "surface-variant": "#e9ded4",
        "surface-tint": "#536b55",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f7efe8",
        "surface-container": "#f1e8df",
        "surface-container-high": "#eadfd5",
        "surface-container-highest": "#e3d7cc",

        "on-surface": "#211d1a",
        "on-surface-variant": "#51473f",
        "inverse-surface": "#352f2a",
        "inverse-on-surface": "#f7efe8",

        outline: "#7c7268",
        "outline-variant": "#cfc3b8",

        primary: "#536b55",
        "on-primary": "#ffffff",
        "primary-container": "#6d846e",
        "on-primary-container": "#ffffff",
        "inverse-primary": "#b8d2b7",
        "primary-fixed": "#d6ead1",
        "primary-fixed-dim": "#b8d2b7",
        "on-primary-fixed": "#132515",
        "on-primary-fixed-variant": "#3c523e",

        secondary: "#7a5c49",
        "on-secondary": "#ffffff",
        "secondary-container": "#f1d9ca",
        "on-secondary-container": "#5f4636",
        "secondary-fixed": "#f1d9ca",
        "secondary-fixed-dim": "#d9bba9",
        "on-secondary-fixed": "#2e1508",
        "on-secondary-fixed-variant": "#604637",

        tertiary: "#9a5a43",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#ba7359",
        "on-tertiary-container": "#ffffff",
        "tertiary-fixed": "#f8d8cb",
        "tertiary-fixed-dim": "#e0b29f",
        "on-tertiary-fixed": "#3a1207",
        "on-tertiary-fixed-variant": "#743c2a",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
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
          "0 4px 24px -4px rgba(83, 107, 85, 0.10), 0 2px 8px -2px rgba(122, 92, 73, 0.08)",
        "ambient-hover":
          "0 12px 32px -8px rgba(83, 107, 85, 0.16), 0 4px 12px -4px rgba(122, 92, 73, 0.10)",
      },
      maxWidth: {
        content: "1024px",
      },
    },
  },
  plugins: [],
};

export default config;
