
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faClipboardList, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const NavMenu = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut(); // Cierra la sesión en Supabase
      navigate("/"); // Redirige al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="navbar bg-base-200 shadow-md p-4">
      {/* Menú de navegación */}
      <div className="flex-1">
        <Link to="/clientes" className="btn btn-ghost normal-case text-xl">
          Gestión ST
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/clientes" className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
              <span>Clientes</span>
            </Link>
          </li>
          <li>
            <Link to="/servicios" className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faClipboardList} className="text-green-500" />
              <span>Servicios</span>
            </Link>
          </li>
        </ul>
        <button
          onClick={handleSignOut}
          className="btn btn-error ml-4 flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
};

export default NavMenu;
