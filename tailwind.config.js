/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand green palette
        brand: {
          50:  "#f0fdf8",
          100: "#dcfcee",
          200: "#b8f8da",
          300: "#84f0bc",
          400: "#48de97",
          500: "#00b37a",
          600: "#008751",   // primary CTA — high-contrast emerald
          700: "#006b40",
          800: "#005432",
          900: "#003d25",
        },
        // Surface colours — premium light-mint palette
        surface: {
          0:   "#F8FBF9",   // page background (light-mint off-white)
          1:   "#F2F8F5",   // card level 1
          2:   "#EAF5EE",   // stat/metric card surface
          3:   "#D5EBD9",   // borders / dividers
          4:   "#B8D9BF",   // elevated borders
        },
        // Verdict decision colors
        invest: {
          DEFAULT: "#00c47a",
          dim:     "#00c47a22",
          text:    "#006b40",
        },
        pass: {
          DEFAULT: "#ef4444",
          dim:     "#ef444422",
          text:    "#dc2626",
        },
        hold: {
          DEFAULT: "#f59e0b",
          dim:     "#f59e0b22",
          text:    "#d97706",
        },
        // Text hierarchy — deep dark forest greens for light bg
        ink: {
          muted:   "#8aA898",
          subtle:  "#5a7a68",
          base:    "#334d3d",
          strong:  "#1a3028",
          loud:    "#11221A",
          white:   "#11221A",   // deepest text (forest green, not literal white)
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease-out both",
        "slide-up":   "slideUp 0.4s ease-out both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":    "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "card":        "0 1px 4px rgba(17,34,26,0.06), 0 1px 2px rgba(17,34,26,0.04)",
        "card-hover":  "0 8px 30px rgba(0,135,81,0.10), 0 1px 8px rgba(0,135,81,0.06)",
        "pill-search": "0 2px 20px rgba(17,34,26,0.07), 0 0 0 1px rgba(0,135,81,0.08)",
        "glow-brand":  "0 0 20px rgba(0,135,81,0.20)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
