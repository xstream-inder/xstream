import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom Adult Industry Palette
        xred: {
          500: "#ED1C24", // Xhamster Red
          600: "#C41017",
          700: "#9B0D12",
        },
        dark: {
          950: "#0A0A0A", // Very Dark
          900: "#121212", // OLED-friendly Dark
          800: "#1E1E1E", // Card BG
          700: "#2C2C2C", // Hover
          600: "#3D3D3D", // Component Interaction
        }
      },
      aspectRatio: {
        'video': '16 / 9',
      },
      keyframes: {
        'splash-logo': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'splash-text': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'splash-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'splash-logo': 'splash-logo 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'splash-text': 'splash-text 0.5s ease-out 0.4s both',
        'splash-bar': 'splash-bar 1.6s ease-in-out 0.3s both',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;
