import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // Brighter and deeper tones for contrast
        lamaSky: "#0EA5E9",           // Sky blue - vibrant
        lamaSkyLight: "#E0F2FE",      // Sky background - subtle

        lamaPurple: "#7C3AED",        // Deep purple
        lamaPurpleLight: "#EDE9FE",   // Soft lavender

        lamaYellow: "#F59E0B",        // Rich amber
        lamaYellowLight: "#FEF9C3",   // Pale yellow

        lamaGreen: "#10B981",         // Emerald green
        lamaGreenLight: "#D1FAE5",    // Soft green

        lamaText: "#1E293B",          // Slate-800 (for strong visibility on light bg)
        lamaTextMuted: "#475569",     // Slate-600 (for labels, secondary text)
      },
    },
  },
  plugins: [],
};

export default config;
