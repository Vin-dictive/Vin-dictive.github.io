/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        label: ["var(--font-space-grotesk)", "ui-monospace", "monospace"],
      },
      colors: {
        folio: {
          surface: "rgb(var(--folio-surface) / <alpha-value>)",
          "surface-low": "rgb(var(--folio-surface-low) / <alpha-value>)",
          "surface-container": "rgb(var(--folio-surface-container) / <alpha-value>)",
          "surface-high": "rgb(var(--folio-surface-high) / <alpha-value>)",
          "surface-highest": "rgb(var(--folio-surface-highest) / <alpha-value>)",
          "on-surface": "rgb(var(--folio-on-surface) / <alpha-value>)",
          "on-surface-variant": "rgb(var(--folio-on-surface-variant) / <alpha-value>)",
          primary: "rgb(var(--folio-primary) / <alpha-value>)",
          "primary-fixed": "rgb(var(--folio-primary-fixed) / <alpha-value>)",
          "on-primary": "rgb(var(--folio-on-primary) / <alpha-value>)",
          tertiary: "rgb(var(--folio-tertiary) / <alpha-value>)",
          secondary: "rgb(var(--folio-secondary) / <alpha-value>)",
          outline: "rgb(var(--folio-outline) / <alpha-value>)",
          "outline-variant": "rgb(var(--folio-outline-variant) / <alpha-value>)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}