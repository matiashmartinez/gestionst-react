import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState("light");

  // Detectar tema inicial basado en preferencia del sistema o localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const userPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(userPrefersDark ? "dark" : "light");
    }
  }, []);

  // Aplicar el tema actual al atributo `data-theme` y guardar en localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Alternar entre temas
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      className="btn btn-primary flex items-center space-x-2"
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <>
          <FontAwesomeIcon icon={faMoon} className="text-xl" />
          <span>Modo Oscuro</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faSun} className="text-xl" />
          <span>Modo Claro</span>
        </>
      )}
    </button>
  );
};

export default ThemeSwitcher;
