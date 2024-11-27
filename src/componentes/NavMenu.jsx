import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // Importa la instancia de supabase

const NavMenu = () => {
  const navigate = useNavigate(); // Usamos el hook useNavigate para redirigir al usuario después de cerrar sesión

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut(); // Cerrar sesión en Supabase
      navigate('/'); // Redirigir al usuario a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="nav-menu">
      <ul>
        <li><Link to="/clientes">Clientes</Link></li>
        <li><Link to="/servicios">Servicios</Link></li>
      </ul>
      <button className="logout-btn" onClick={handleSignOut}>Cerrar sesión</button>
    </nav>
  );
};

export default NavMenu;
