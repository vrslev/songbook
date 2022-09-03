const { zinc } = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./frontend/**/*.{vue,ts}"],
  theme: { colors: {} }, // remove default colors
  plugins: [require("daisyui")],
  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          "base-200": zinc[50],
          "base-content": "black",
          neutral: "black",
          "neutral-focus": zinc[800],
        },
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          "base-100": zinc[800],
          "base-200": zinc[900],
          "base-300": zinc[700],
          "base-content": "white",
          neutral: zinc[700],
          "neutral-focus": zinc[600],
        },
      },
    ],
  },
};
