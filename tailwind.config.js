/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"], // Ruta a tus archivos JSX
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // Cargar DaisyUI
  daisyui: {
    themes: ["light", "dark", "cupcake"], // Temas predefinidos de DaisyUI
  },
};
