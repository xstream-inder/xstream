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
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;
