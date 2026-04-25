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
        background: "#fbf9f8",
        "on-background": "#1b1c1c",

        surface: "#fbf9f8",
        "surface-dim": "#dcd9d9",
        "surface-bright": "#fbf9f8",
        "surface-variant": "#e4e2e1",
        "surface-tint": "#486550",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f3",
        "surface-container": "#f0eded",
        "surface-container-high": "#eae8e7",
        "surface-container-highest": "#e4e2e1",

        "on-surface": "#1b1c1c",
        "on-surface-variant": "#424843",
        "inverse-surface": "#303030",
        "inverse-on-surface": "#f2f0f0",

        outline: "#727972",
        "outline-variant": "#c2c8c1",

        primary: "#47644f",
        "on-primary": "#ffffff",
        "primary-container": "#5f7d67",
        "on-primary-container": "#ffffff",
        "inverse-primary": "#aeceb5",
        "primary-fixed": "#caebd0",
        "primary-fixed-dim": "#aeceb5",
        "on-primary-fixed": "#042110",
        "on-primary-fixed-variant": "#304d3a",

        secondary: "#496175",
        "on-secondary": "#ffffff",
        "secondary-container": "#cde5fe",
        "on-secondary-container": "#4f677c",
        "secondary-fixed": "#cde5fe",
        "secondary-fixed-dim": "#b1c9e1",
        "on-secondary-fixed": "#021e2f",
        "on-secondary-fixed-variant": "#32495d",

        tertiary: "#8c4c34",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#a9644b",
        "on-tertiary-container": "#ffffff",
        "tertiary-fixed": "#ffdbcf",
        "tertiary-fixed-dim": "#ffb59b",
        "on-tertiary-fixed": "#380d00",
        "on-tertiary-fixed-variant": "#703620",

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
          "0 4px 24px -4px rgba(71, 100, 79, 0.08), 0 2px 8px -2px rgba(71, 100, 79, 0.04)",
        "ambient-hover":
          "0 12px 32px -8px rgba(71, 100, 79, 0.12), 0 4px 12px -4px rgba(71, 100, 79, 0.06)",
      },
      maxWidth: {
        content: "1024px",
      },
    },
  },
  plugins: [],
};

export default config;
