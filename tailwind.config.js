export const content = [
  "./src/app/**/*.{js,ts,jsx,tsx}",
  "./src/pages/**/*.{js,ts,jsx,tsx}",
  "./src/components/**/*.{js,ts,jsx,tsx}",
];

export const theme = {
  extend: {
    animation: {
      "bounce-slow": "bounce 2s infinite",
      "spin-slow": "spin 3s linear infinite",
      float: "float 6s ease-in-out infinite",
      "pulse-shadow": "pulse-shadow 1.5s ease-in-out",
      "fade-in-scale": "fade-in-scale 0.3s ease-out",
      shimmer: "shimmer 2.5s infinite",
      "progress-bar": "progress-bar 1.2s infinite ease-in-out",
      "pulse-wave": "pulse-wave 2s ease-out infinite",
    },
    keyframes: {
      float: {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-10px)" },
      },
      "fade-in-scale": {
        "0%": { opacity: 0, transform: "scale(0.9)" },
        "100%": { opacity: 1, transform: "scale(1)" },
      },
      "pulse-shadow": {
        "0%, 100%": { boxShadow: "0 0 0 0 rgba(236, 72, 153, 0)" },
        "50%": { boxShadow: "0 0 0 15px rgba(236, 72, 153, 0.2)" },
      },
      shimmer: {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
      "progress-bar": {
        "0%": { width: "0%" },
        "100%": { width: "100%" },
      },
      "pulse-wave": {
        "0%": { transform: "scale(0.95)", opacity: "1" },
        "100%": { transform: "scale(1.3)", opacity: "0" },
      },
    },
  },
};

export const plugins = [];

export const darkMode = "class";
