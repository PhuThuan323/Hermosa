/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        primaryFg: "var(--primary-fg)",
        surface: "var(--surface)",
        surfaceAlt: "var(--surface-alt)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        inkDim: "var(--ink-dim)",
        border: "var(--border)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 4px 16px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem"
      }
    },
  },
  plugins: [],
}
