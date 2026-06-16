import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          50: "#f5f7ff",
          100: "#eef0ff",
          200: "#dfe4ff",
          300: "#c6cdff",
          400: "#a3afff",
          500: "#7f8bfa",
          600: "#5f6bef",
          700: "#4f55d8",
          800: "#4146ae",
          900: "#3a418a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
