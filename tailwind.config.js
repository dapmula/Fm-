/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0F",
        surface: "#16161D",
        surface2: "#1F1F29",
        line: "#2A2A36",
        muted: "#8A8A99",
        text: "#F4F4F8",
        brand: "#7C5CFF",
        love: "#FF4D6D",
        bronze: "#CD7F32",
        silver: "#C0C7D1",
        gold: "#FFC83D",
        diamond: "#8FE3FF",
      },
    },
  },
  plugins: [],
};
