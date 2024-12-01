/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Archivo principal HTML
    "./src/**/*.{js,jsx,ts,tsx}", // Todos los archivos en src
  ],
  theme: {
    extend: {},
  },
  // eslint-disable-next-line no-undef
  plugins: [require("daisyui")],
};
