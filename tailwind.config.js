/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: process.env.DARK_MODE ? process.env.DARK_MODE : "class",
  content: [
    "./app/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./components/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./utils/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./*.{html,js,jsx,ts,tsx,mdx}",
    "./src/**/*.{html,js,jsx,ts,tsx,mdx}",
  ],
  presets: [require("nativewind/preset")],
  important: "html",
  theme: {
    extend: {
      colors: {
        ui: {
          paper: "#FFFEFB",
          ink: "#242624",
          porcelain: "#F7F4EE",
          midnight: "#17252B",
          champagne: "#C7A66A",
          aubergine: "#563B49",
          forest: "#30463E",
          slate: "#6D716D",
          parchment: "#EAE3D7",
          danger: "#B4233D",
          surface: {
            page: "#F7F4EE",
            raised: "#FFFEFB",
            inset: "#EAE3D7",
            dark: "#17252B",
          },
          dark: {
            background: "#17252B",
            foreground: "#FFFEFB",
            primary: "#C7A66A",
            accent: "#563B49",
            highlight: "#30463E",
          },
        },
        indicator: {
          primary: "rgb(var(--color-indicator-primary)/<alpha-value>)",
          error: "rgb(var(--color-indicator-error)/<alpha-value>)",
        },
      },
      fontFamily: {
        display: ["serif"],
        heading: undefined,
        body: undefined,
        mono: undefined,
        dmSans: "var(--font-dm-sans)", // headings
        workSans: "var(--font-work-sans)", //texts
        jakarta: ["var(--font-plus-jakarta-sans)"],
        roboto: ["var(--font-roboto)"],
        code: ["var(--font-source-code-pro)"],
        inter: ["var(--font-inter)"],
        "space-mono": ["var(--font-space-mono)"],
      },
      fontWeight: {
        extrablack: "950",
      },
      fontSize: {
        "2xs": "10px",
      },
      boxShadow: {
        "hard-1": "-2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
        "hard-2": "0px 3px 10px 0px rgba(38, 38, 38, 0.20)",
        "hard-3": "2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
        "hard-4": "0px -3px 10px 0px rgba(38, 38, 38, 0.20)",
        "hard-5": "0px 2px 10px 0px rgba(38, 38, 38, 0.10)",
        "soft-1": "0px 0px 10px rgba(38, 38, 38, 0.1)",
        "soft-2": "0px 0px 20px rgba(38, 38, 38, 0.2)",
        "soft-3": "0px 0px 30px rgba(38, 38, 38, 0.1)",
        "soft-4": "0px 0px 40px rgba(38, 38, 38, 0.1)",
      },
    },
  },
};
