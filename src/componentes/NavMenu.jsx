import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";


const NavMenu = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut(); // Cerrar sesión en Supabase
      navigate("/"); // Redirigir al usuario a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="navbar bg-base-100  p-4">
      {/* Menú de navegación */}
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Gestión ST
        </Link>
      </div>

      {/* Opciones del menú */}
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/clientes">Clientes</Link>
          </li>
          <li>
            <Link to="/servicios">Servicios</Link>
          </li>
        </ul>
        <button
          onClick={handleSignOut}
          className="btn btn-error ml-4 p-4"
        >
          Cerrar sesión
        </button>
        
      </div>
    </nav>
  );
};

export default NavMenu;
