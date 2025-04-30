export const content = [
  "./src/app/**/*.{js,ts,jsx,tsx}",
  "./src/pages/**/*.{js,ts,jsx,tsx}",
  "./src/components/**/*.{js,ts,jsx,tsx}",
];

export const theme = {
  extend: {
    animation: {
      'bounce-slow': 'bounce 2s infinite',
      'float': 'float 3s ease-in-out infinite',
    },
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
    },
  },
};

export const plugins = [];
